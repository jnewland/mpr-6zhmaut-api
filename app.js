var express = require("express");
var morgan = require("morgan");
var bodyParser = require("body-parser");
var async = require("async");

var app = express();
var logFormat = "'[:date[iso]] - :remote-addr - :method :url :status :response-time ms - :res[content-length]b'";
app.use(morgan(logFormat));
app.use(bodyParser.text({ type: '*/*' }));

const ReQuery = /^true$/i.test(process.env.REQUERY);
const UseCORS = /^true$/i.test(process.env.CORS);
const AmpCount = process.env.AMPCOUNT || 1;
const BaudRate = parseInt(process.env.BAUDRATE || 9600);
const SerialPort = require("serialport");
const Readline = require('@serialport/parser-readline')

var device = process.env.DEVICE || "/dev/ttyUSB0";
var connection = new SerialPort(device, {
  baudRate: BaudRate,
});

const parser = connection.pipe(new Readline({ delimiter: "\n", encoding: "ascii" }))

connection.on("open", function () {
  var zones = {};

  const queryControllers = async () => {
    for (let i = 1; i <= AmpCount; i++) {
      connection.write("?" + i.toString() + "0\r");
      await async.until(
        function (callback) {
          callback(null, typeof zones !== "undefined" && Object.keys(zones).length === (6 * i));
        },
        function (callback) { setTimeout(callback, 10); }
      );
    }
  }

  connection.write("?10\r");
  if(AmpCount >= 2){
    setTimeout(function(){ connection.write("?20\r"); }, 1000);
  }
  if(AmpCount >= 3){
    setTimeout(function(){ connection.write("?30\r"); }, 2000);
  }

  UseCORS && app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

  parser.on('data', function (data) {
    console.log(data);
    if (data.startsWith('Command Error.')) { // returned from amp device
      process.exit(1);
    }
    var zone = data.toString("ascii").match(/#>(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
    if (zone != null) {
      zones[zone[1]] = {
        "zone": zone[1],
        "pa": zone[2],
        "pr": zone[3],
        "mu": zone[4],
        "dt": zone[5],
        "vo": zone[6],
        "tr": zone[7],
        "bs": zone[8],
        "bl": zone[9],
        "ch": zone[10],
        "ls": zone[11]
      };
    }
  });

  app.get('/zones', function (req, res) {
    var zoneCount = Object.keys(zones).length;
    if (ReQuery) {
      zones = {};
      queryControllers();
    }
    async.until(
      function (callback) {
        callback(null, typeof zones !== "undefined" && Object.keys(zones).length === zoneCount);
      },
      function (callback) {
        setTimeout(callback, 10);
      },
      function () {
        var zoneArray = [];
        for (var o in zones) {
          zoneArray.push(zones[o]);
        }
        res.json(zoneArray);
      }
    );
  });

  // Only allow query and control of single zones
  app.param('zone', function (req, res, next, zone) {
    if (zone % 10 > 0 && Number(zone) != "NaN") {
      req.zone = zone;
      next();
    } else {
      res.status(500).send({ error: zone + ' is not a valid zone' });
    }
  });

  app.get('/zones/:zone', function (req, res) {
    if (ReQuery) {
      zones = {};
      queryControllers();
    }
    async.until(
      function (callback) { callback(null, typeof zones[req.zone] !== "undefined"); },
      function (callback) {
        setTimeout(callback, 10);
      },
      function () {
        res.json(zones[req.zone]);
      }
    );
  });

  // Validate and standarize control attributes
  app.param('attribute', function (req, res, next, attribute) {
    if (typeof attribute !== 'string') {
      res.status(500).send({ error: attribute + ' is not a valid zone control attribute' });
    }
    switch (attribute.toLowerCase()) {
      case "pa":
        req.attribute = "pa";
        next();
        break;
      case "pr":
      case "power":
        req.attribute = "pr";
        next();
        break;
      case "mu":
      case "mute":
        req.attribute = "mu";
        next();
        break;
      case "dt":
        req.attribute = "dt";
        next();
        break;
      case "vo":
      case "volume":
        req.attribute = "vo";
        next();
        break;
      case "tr":
      case "treble":
        req.attribute = "tr";
        next();
        break;
      case "bs":
      case "bass":
        req.attribute = "bs";
        next();
        break;
      case "bl":
      case "balance":
        req.attribute = "bl";
        next();
        break;
      case "ch":
      case "channel":
      case "source":
        req.attribute = "ch";
        next();
        break;
      case "ls":
      case "keypad":
        req.attribute = "ls";
        next();
        break;
      default:
        res.status(500).send({ error: attribute + ' is not a valid zone control attribute' });
    }
  });

  app.post('/zones/:zone/:attribute', function (req, res) {
    zones = {};
    const writeAttribute = async () => {
      connection.write("<" + req.zone + req.attribute + req.body + "\r");
      await async.until(
        function (callback) {
          callback(null, typeof zones !== "undefined" && Object.keys(zones).length === 1);
        },
        function (callback) { setTimeout(callback, 10); }
      );
    }
    writeAttribute();
    queryControllers();
    async.until(
      function (callback) { callback(null, typeof zones[req.zone] !== "undefined"); },
      function (callback) {
        setTimeout(callback, 10);
      },
      function () {
        res.json(zones[req.zone]);
      }
    );
  });

  app.get('/zones/:zone/:attribute', function (req, res) {
    zones = {};
    queryControllers();
    async.until(
      function (callback) { callback(null, typeof zones[req.zone] !== "undefined"); },
      function (callback) {
        setTimeout(callback, 10);
      },
      function () {
        res.send(zones[req.zone][req.attribute]);
      }
    );
  });

  app.listen(process.env.PORT || 8181);
});

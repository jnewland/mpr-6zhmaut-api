var express    = require("express");
var morgan     = require("morgan");
var bodyParser = require("body-parser");
var serialport = require("serialport");
var async      = require("async");

var app = express();
var logFormat = "'[:date[iso]] - :remote-addr - :method :url :status :response-time ms - :res[content-length]b'";
app.use(morgan(logFormat));
app.use(bodyParser.text({type: '*/*'}));

var SerialPort = serialport.SerialPort;
var device     = process.env.DEVICE || "/dev/ttyUSB0";
var connection = new SerialPort(device, {
  baudrate: 9600,
  parser: serialport.parsers.readline("\n")
});

connection.on("open", function () {
  var zones = {};

  connection.write("?10\r");
  connection.write("?20\r");
  connection.write("?30\r");

  connection.on('data', function(data) {
    console.log(data);
    var zone = data.match(/#>(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/);
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

  app.get('/zones', function(req, res) {
    async.until(
      function () { return typeof zones !== "undefined"; },
      function (callback) {
        setTimeout(callback, 10);
      },
      function () {
        var zoneArray = new Array;
        for(var o in zones) {
          zoneArray.push(zones[o]);
        }
        res.json(zoneArray);
      }
    );
  });

  // Only allow query and control of single zones
  app.param('zone', function(req, res, next, zone) {
    if (zone % 10 > 0 && Number(zone) != "NaN") {
      req.zone = zone;
      next();
    } else {
      res.status(500).send({ error: zone + ' is not a valid zone'});
    }
  });

  app.get('/zones/:zone', function(req, res) {
    async.until(
      function () { return typeof zones[req.zone] !== "undefined"; },
      function (callback) {
        setTimeout(callback, 10);
      },
      function () {
        res.json(zones[req.zone]);
      }
    );
  });

  // Validate and standarize control attributes
  app.param('attribute', function(req, res, next, attribute) {
    if (typeof attribute !== 'string') {
      res.status(500).send({ error: attribute + ' is not a valid zone control attribute'});
    }
    switch(attribute.toLowerCase()) {
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
        res.status(500).send({ error: attribute + ' is not a valid zone control attribute'});
    }
  });

  app.post('/zones/:zone/:attribute', function(req, res) {
    zones[req.zone] = undefined;
    connection.write("<"+req.zone+req.attribute+req.body+"\r");
    connection.write("?10\r");
    connection.write("?20\r");
    connection.write("?30\r");
    async.until(
      function () { return typeof zones[req.zone] !== "undefined"; },
      function (callback) {
        setTimeout(callback, 10);
      },
      function () {
        res.json(zones[req.zone]);
      }
    );
  });

  app.get('/zones/:zone/:attribute', function(req, res) {
    zones[req.zone] = undefined;
    connection.write("?10\r");
    connection.write("?20\r");
    connection.write("?30\r");
    async.until(
      function () { return typeof zones[req.zone] !== "undefined"; },
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



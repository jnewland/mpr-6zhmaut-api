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
var connection = new SerialPort("/dev/ttyUSB0", {
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
        "power": zone[3],
        "mute": zone[4],
        "dt": zone[5],
        "volume": zone[6],
        "treble": zone[7],
        "bass": zone[8],
        "balance": zone[9],
        "channel": zone[10],
        "keypad": zone[11]
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

  // Validate and standarize control actions
  app.param('action', function(req, res, next, action) {
    if (typeof action !== 'string') {
      res.status(500).send({ error: action + ' is not a valid zone control action'});
    }
    switch(action.toLowerCase()) {
      case "pa":
        req.action = "pa";
        next();
        break;
      case "pr":
      case "power":
        req.action = "pr";
        next();
        break;
      case "mu":
      case "mute":
        req.action = "mu";
        next();
        break;
      case "dt":
        req.action = "dt";
        next();
        break;
      case "vo":
      case "volume":
        req.action = "vo";
        next();
        break;
      case "tr":
      case "treble":
        req.action = "tr";
        next();
        break;
      case "bs":
      case "bass":
        req.action = "bs";
        next();
        break;
      case "bl":
      case "balance":
        req.action = "bl";
        next();
        break;
      case "ch":
      case "channel":
      case "source":
        req.action = "ch";
        next();
        break;
      default:
        res.status(500).send({ error: action + ' is not a valid zone control action'});
    }
  });

  app.post('/zones/:zone/:action', function(req, res) {
    zones[req.zone] = undefined;
    connection.write("<"+req.zone+req.action+req.body+"\r");
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

  app.get('/zones/:zone/:action', function(req, res) {
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
        res.json(zones[req.zone][req.action]);
      }
    );
  });

  app.listen(process.env.PORT || 8181);
});



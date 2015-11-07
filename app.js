var express = require('express');
var morgan = require('morgan');
var bodyParser = require('body-parser');
var parameterize = require('parameterize');
var serialport = require("serialport");

var app = express();
app.use(bodyParser.json());
var logFormat = "'[:date[iso]] - :remote-addr - :method :url :status :response-time ms - :res[content-length]b'";
app.use(morgan(logFormat));

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
        "source": zone[10],
        "keypad": zone[11]
      };
    }
  });

  app.get('/zones', function(req, res) {
    var zoneArray = new Array;
    for(var o in zones) {
      zoneArray.push(zones[o]);
    }
    res.json(zoneArray);
  });

  app.get('/zones/:zone', function(req, res) {
    res.json(zones[req.params.zone]);
  });

  app.put('/zones/:zone', function(req, res) {
    connection.write("<"+req.params.zone+req.body.action+req.body.value+"\r");
    connection.write("?10\r");
    connection.write("?20\r");
    connection.write("?30\r");
    var hash = {}
    hash[req.body.action] = req.body.value;
    res.json(hash);
  });

  app.listen(process.env.PORT || 8181);
});



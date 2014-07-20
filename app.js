var climateSensor = require('climate');
var accelerometer = require('accelerometer');
// var ambient = require('ambient');

var climate = [];
var humidity = [];
var acceleration =[];
var light = [];
var sound = [];

function main(){

  var getClimateData = function(data){
    var tempObj = {
      time: data.time,
      temperature: data.temperature
    };
    temperature.push(tempObj);

    var humObj = {
      time: data.time,
      humidity: data.humidity
    };
    humidity.push(humObj);
  };
  climateSensor(1000, 'B', getClimateData);

  var getAccelData = function(data){
    var accelObj = {
      time: data.time,
      accel: data.accel
    };
    acceleration.push(accelObj);
  };
  accelerometer('C',getAccelData);

  var getAmbientData = function(data){
    if (data[light] !== undefined){
      var lightObj = {
        time: data.time,
        light: data.light
      };
      light.push(lightObj);
    } else {
      var soundObj = {
        time: data.time,
        sound: data.sound
      };
      sound.push(soundObj);
    }
  };

  ambient('D', getAmbientData);
}

/* HANDLERS */
var handlers = {
    readAcceleration: function (req, res) { 
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200);
        res.end(JSON.stringify(acceleration));
    },
    readHumidity: function (req, res) { 
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200);
        res.end(JSON.stringify(humidity));
    },
    readClimate: function (req, res) { 
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200);
        res.end(JSON.stringify(climate));
    },
    readLight: function (req, res) { 
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200);
        res.end(JSON.stringify(light));
    },
    readSound: function (req, res) { 
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200);
        res.end(JSON.stringify(sound));
    }
};

/* HTTP SERVER */
var http  = require("http");
var url = require('url');

var server = http.createServer(function (req, res) {
    // set up routing
    var url_parts = url.parse(req.url, true);
    var command = url_parts.query.message;
    if (handlers[command]) { 
        handlers[command](req, res, url_parts.query.data); 
    } else {
        res.write("Use the API");
        res.end();
    }
});
server.listen(8000);
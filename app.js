var climateSensor = require('./climate');
var accelerometer = require('./accelerometer');
var ambient = require('./ambient');
var phone = require('./tesselPhone');

var climate = [];
var humidity = [];
var acceleration =[];
var light = [];
var sound = [];

/* API for phone:
phone.sendMessage(number:String, message:String);
*/

function main(){

  var msg = function(){
    phone.sendMessage('17654096466', 'data exceeded threshold');
  };

  var run = throttle(msg,20000, {trailing:false});

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
    console.log('clim', data);
  };
  climateSensor(1000, 'C', getClimateData);

  var getAccelData = function(data){
    var accelObj = {
      time: data.time,
      accel: data.accel
    };
    acceleration.push(accelObj);

    run();
    console.log('accel', data);

  };
  accelerometer('D',getAccelData);

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

    run();
    console.log('am', data);
  };
  ambient('B', getAmbientData);

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


function throttle(func, wait, options) {
    var context, args, result;
    var timeout = null;
    var previous = 0;
    options || (options = {});
    var later = function() {
      previous = options.leading === false ? 0 : Date.now();
      timeout = null;
      result = func.apply(context, args);
      context = args = null;
    };
    return function() {
      var now = Date.now();
      if (!previous && options.leading === false) previous = now;
      var remaining = wait - (now - previous);
      context = this;
      args = arguments;
      if (remaining <= 0) {
        clearTimeout(timeout);
        timeout = null;
        previous = now;
        result = func.apply(context, args);
        context = args = null;
      } else if (!timeout && options.trailing !== false) {
        timeout = setTimeout(later, remaining);
      }
      return result;
    };
  };

  main();
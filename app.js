var climate = [];
var humidity = [];
var acceleration =[];
var light = [];
var sound = [];

var climatelib = require('climate-si7020');
function Climate (sampleSize, port, callback){

  var climate = climatelib.use(tessel.port[port]);

  climate.on('ready', function () {
    console.log('Connected to si7020');

    // Loop forever
    setImmediate(function loop () {
      climate.readTemperature('f', function (err, temp) {
        climate.readHumidity(function (err, humid) {
           //console.log('Degrees:', temp.toFixed(4) + 'F', 'Humidity:', humid.toFixed(4) + '%RH');
          var temp = {
            time: Date.now(),
            temperature: temp.toFixed(4),
            humidity: humid.toFixed(4)
          };

          callback(obj);
          setTimeout(loop, sampleSize);
        });
      });
    });
  });

  climate.on('error', function(err) {
    console.log('error connecting module', err);
  });
}

var accellib = require('accel-mma84');
function Accelerometer (port, callback){

  var accel = accellib.use(tessel.port['B']);
  this.accelFilter = {
    init: false,
    x: 0,
    y: 0,
    z: 0
  };
  this.delta = {
    x: 0,
    y: 0,
    z: 0
  };

  // Initialize the accelerometer.
  accel.on('ready', function () {
      // Stream accelerometer data
    accel.on('data', function (xyz) {
      if (!this.accelFilter.init){
        this.accelFilter.x = xyz[0];
        this.accelFilter.y = xyz[1];
        this.accelFilter.z = xyz[2];
        this.accelFilter.init = true;
      }else{
        var mag = highPassFilter(xyz);

        // console.log('mag:', mag);
        if (mag > 1.5){
          var obj = {
            time: Date.now(),
            accel: mag
          };
          callback(obj);
        }
      }
      // console.log('x:', xyz[0].toFixed(2),
      //   'y:', xyz[1].toFixed(2),
      //   'z:', xyz[2].toFixed(2));
    }.bind(this));
  }.bind(this));

  accel.on('error', function(err){
    console.log('Error:', err);
  });
}

function highPassFilter(currentAccel){
  var kFilteringFactor = 0.1;
  var previous = {
    x: this.accelFilter.x,
    y: this.accelFilter.y,
    z: this.accelFilter.z
  };

  this.accelFilter.x = currentAccel[0] - ( (currentAccel[0] * kFilteringFactor) + (previous.x * (1.0 - kFilteringFactor)) );
  this.accelFilter.y = currentAccel[1] - ( (currentAccel[1] * kFilteringFactor) + (previous.y * (1.0 - kFilteringFactor)) );
  this.accelFilter.z = currentAccel[2] - ( (currentAccel[2] * kFilteringFactor) + (previous.z * (1.0 - kFilteringFactor)) );

  this.delta.x =  Math.abs(this.accelFilter.x - previous.x);
  this.delta.y =  Math.abs(this.accelFilter.y - previous.y);
  this.delta.z =  Math.abs(this.accelFilter.z - previous.z);

  // console.log('data:', this.accelFilter, currentAccel, this.delta);

  return Math.sqrt(this.delta.x*this.delta.x + this.delta.y*this.delta.y + this.delta.z*this.delta.z);
}

var ambientlib = require('ambient-attx4');
function Ambient(port, callback){

  var ambient = ambientlib.use(tessel.port['A']);
  ambient.on('ready', function () {
   // Get points of light and sound data.
    setInterval( function () {
      ambient.getLightLevel( function(err, ldata) {
        ambient.getSoundLevel( function(err, sdata) {
          console.log("Light level:", ldata.toFixed(8), " ", "Sound Level:", sdata.toFixed(8));
      });
    })}, 500); // The readings will happen every .5 seconds unless the trigger is hit

    ambient.setLightTrigger(0.1);

    // Set a light level trigger
    // The trigger is a float between 0 and 1
    ambient.on('light-trigger', function(data) {
      console.log("Our light trigger was hit:", data);
      var obj = {
        time: Date.now(),
        light: data
      };
      callback(obj);

      // Clear the trigger so it stops firing
      ambient.clearLightTrigger();
      //After 1.5 seconds reset light trigger
      setTimeout(function () {

          ambient.setLightTrigger(0.1);

      },1500);
    });

    // Set a sound level trigger
    // The trigger is a float between 0 and 1
    ambient.setSoundTrigger(0.2);

    ambient.on('sound-trigger', function(data) {
      console.log("Something happened with sound: ", data);
      var obj = {
        time: Date.now(),
        sound: data
      };
      callback(obj);

      // Clear it
      ambient.clearSoundTrigger();

      //After 1.5 seconds reset sound trigger
      setTimeout(function () {

          ambient.setSoundTrigger(0.2);

      },1500);

    });
  });

  ambient.on('error', function (err) {
    console.log(err);
  });
}

var hardware = tessel.port['A'];
var gprslib = require('gprs-sim900');
var phone = (function() {
  //  Port, callback
  var gprs = gprslib.use(hardware); 

  gprs.on('ready', function() {
    console.log('GPRS module connected to Tessel. Searching for network...');
  });

  //  Emit unsolicited messages beginning with...
  gprs.emitMe(['NORMAL POWER DOWN', 'RING', '+']);

  gprs.on('NORMAL POWER DOWN', function powerDaemon () {
    gprs.emit('powered off');
    console.log('The GPRS Module is off now.');
  });

  gprs.on('RING', function someoneCalledUs () {
    var instructions = 'Someone\'s calling!\nType the command \'ATA\' to answer and \'ATH\' to hang up.\nYou\'ll need a mic and headset connected to talk and hear.\nIf you want to call someone, type \'ATD"[their 10+digit number]"\'.';
    console.log(instructions);
  });

  gprs.on('+', function handlePlus (data) {
    console.log('Got an unsolicited message that begins with a \'+\'! Data:', data);
  });

  //  Command the GPRS module via the command line
  process.stdin.resume();
  process.stdin.on('data', function (data) {
    data = String(data).replace(/[\r\n]*$/, '');  //  Removes the line endings
    console.log('got command', [data]);
    gprs._txrx(data, 10000, function(err, data) {
      console.log('\nreply:\nerr:\t', err, '\ndata:');
      data.forEach(function(d) {
        console.log('\t' + d);
      });
      console.log('');
    });
  });

  //  Handle errors
  gprs.on('error', function (err) {
    console.log('Got an error of some kind:\n', err);
  });

  var sendMessage = function (phoneNumber, message) {
      gprs.sendSMS(phoneNumber, message, function (err, data) {
          if (err) { return console.log(err); }
          var success = (data[0] !== -1);
          console.log('Text sent:', success);
          if (success) {
            // If successful, log the number of the sent text
            console.log('GPRS Module sent text #', data[0]);
          }
      });
  };

  return {
    sendMessage: sendMessage
  };
})();


var main = function () {
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
// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
This basic climate example logs a stream
of temperature and humidity to the console.
*********************************************/
var tessel = require('tessel');
// if you're using a si7020 replace this lib with climate-si7020
var climatelib = require('climate-si7020');


// sampleSize (ms)
// port (A,B,C,D)
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


// test = new Climate(2000,'A', function(data){
//   console.log(data);
// });

module.exports = Climate;
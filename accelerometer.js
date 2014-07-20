// Any copyright is dedicated to the Public Domain.
// http://creativecommons.org/publicdomain/zero/1.0/

/*********************************************
This basic accelerometer example logs a stream
of x, y, and z data from the accelerometer
*********************************************/

var tessel = require('tessel');

function Accelerometer (port, callback){

  var accel = require('accel-mma84').use(tessel.port['B']);
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

// test = new Accelerometer('B',function(data){
//    console.log(data);
// });


module.exports = Accelerometer;



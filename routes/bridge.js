var request = require("superagent");
var _ = require('lodash');

var username = "4TLXEh4L7yxsQ0isZbFzHJjwcK9xXtJsMnmdX7Uz";
var baseUrl = 'http://192.168.8.113/api/';
var sensorNames = [
  'Hue temperature sensor',
  'Hue motion sensor',
  'Hue ambient light sensor'
];

var sensorTypes = {
  "ZLLTemperature": {
    key: 'temperature',
    label: 'Temperature'
  },
  "ZLLPresence": {
    key: 'presence',
    label: 'Presence'
  },
  "ZLLLightLevel": {
    key: 'light',
    label: 'Light level'
  }
};

/**
* @name openConnection
* @description Opens connection to sensors, return success if successfull
* @author Antero Hanhirova
* @param {Function} - Returns function with payload
* @returns {Function} - Returns function with payload
*/
exports.openConnection = function(fn){
  console.log("Connecting bridge...");

  var requestUrl = baseUrl + username;
  var sensorList = [];
  request
    .get(requestUrl)
    .then(function(res){
      fn( {success:true} );
    }).catch(function(err){
      fn( {success:false, error: err} );
    });
};

/**
* @name getSensorData
* @description Gets sensor data from local bridge
              [{
                id: {String}, // id to use to control the sensor
                uniqueid: {String}, // unique id of sensor
                sensorId: {String}, // sensorId - one physical device has multiple sensors
                modelid: {String}, // model of sensor
                type: {String}, // Type of sensor
                literalType: {Object}, // Sensor literal type, ( check sensorType variable )
                state: {Object} // Actual sensor data
              }]
* @author Antero Hanhirova
* @param {Function} - Returns function with payload
* @returns {Function} - Returns function with payload
*/
exports.getSensorData = function( fn ) {
  var requestUrl = baseUrl + username + '/sensors';
  var sensorList = [];
  request
    .get(requestUrl)
    .then(function(res){
      var sensorBlock = [];

      // Input all necessary datapoints
      _.each(res.body, function(sensor, index){
        sensor.id = index;
        if ( sensor.name ) {
          _.each(sensorNames, function(sensorName){
            if ( sensor.name.indexOf( sensorName ) !== -1 ) {
              sensor.sensorId = sensor.name.split(' ')[sensor.name.split(' ').length-1];
            }
          });
        }
      });

      // Filter only sensors
      var sensors = _.filter(res.body, function(sensor){
        return sensor.modelid && sensor.modelid === 'SML001';
      });

      // Reduce sensor attributes
      sensors = _.map(sensors, function(sensor){
        return {
          id: sensor.id,
          uniqueid: sensor.uniqueid,
          sensorId: sensor.sensorId,
          modelid: sensor.modelid,
          type: sensor.type,
          literalType: sensorTypes[sensor.type],
          state: sensor.state
        };
      });

      // Put sensors into sensorBlocks per physical device
      // [[sensor,sensor,sensor],[sensor,sensor,sensor]]
      _.each(sensors, function(sensor, index){
        if ( index === 0 ) {
          sensorBlock.push([]);
        } else if ( sensors[index-1] && sensor.sensorId !== sensors[index-1].sensorId ) {
          sensorBlock.push([]);
        }
        sensorBlock[sensorBlock.length-1].push(sensor);
      });
      return fn(sensorBlock);
    })
    .catch(function(err){
      console.error(err);
      return fn([],err);
    });
};

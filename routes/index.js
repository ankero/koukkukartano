var express = require('express');
var background = require('./background');
var bridge = require('./bridge');
var router = express.Router();


var SENSOR_INTERVAL = 60000;

/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


/**
* @name _saveSensorDataToDb
* @description Saves sensorData to db
* @author Antero Hanhirova
* @param {Object} - Sensor object
*/
function _saveSensorDataToDb( sensorData ) {
  var payload = {
    timestamp: new Date().getTime(),
    data: sensorData
  };
  console.log("New sensor payload in pipeline, sending to database.", new Date(payload.timestamp));
  background.putSensorData( payload );
}

/**
* @name _saveLightDataToDb
* @description Saves lightData to db
* @author Antero Hanhirova
* @param {Object} - Sensor object
*/
function _saveLightDataToDb( lightData ) {
  var payload = {
    timestamp: new Date().getTime(),
    data: lightData
  };
  console.log("New light payload in pipeline, sending to database.", new Date(payload.timestamp));
  background.putLightData( payload );
}

/**
* @name _getSensorData
* @description Gets sensor data from bridge
* @author Antero Hanhirova
*/
function _getSensorData() {
  bridge.getSensorData(function(sensorData, result){
    if ( !Array.isArray( sensorData ) ) {
      console.error("Error getting sensor read.");
    } else {
      _saveSensorDataToDb(sensorData);
    }
  });
}

/**
* @name _getLightData
* @description Gets light data from bridge
* @author Antero Hanhirova
*/
function _getLightData() {
  bridge.getLightData(function(lightData, result){
    if ( !Array.isArray( lightData ) ) {
      console.error("Error getting light read.");
    } else {
      _saveLightDataToDb(lightData);
    }
  });
}

/**
* @name _startInterval
* @description Starts sensor get interval
* @author Antero Hanhirova
*/
function _startInterval() {
  console.log("Connections successfull, starting interval.");
  setInterval(function(){
    _getSensorData();
    _getLightData();
  }, SENSOR_INTERVAL);
}


/**
* @name _initBackgroundSync
* @description Initialises background sync with sensors and database
* @author Antero Hanhirova
*/

function _initBackgroundSync() {
  background.openConnections(function( result ){
    if ( !result.success ) {
      console.log("Error connection to db. Shutting down early.");
    } else {

      // Get sensor data
      bridge.openConnection(function( result ){
        if ( result.success ) {
          _startInterval();
        } else {
          console.log("Error initalizing sensor read. Shutting down early. Message to follow.", result.error);
        }
      });
    }
  });
}


_initBackgroundSync();

module.exports = router;

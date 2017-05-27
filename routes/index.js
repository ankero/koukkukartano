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
* @name _saveToDb
* @description Saves sensorData to db
* @author Antero Hanhirova
* @param {Object} - Sensor object
*/
function _saveToDb( sensorData ) {
  var payload = {
    timestamp: new Date().getTime(),
    data: sensorData
  };
  console.log("New payload in pipeline, sending to database.", payload.timestamp);
  background.put( payload );
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
      _saveToDb(sensorData);
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
  setInterval(_getSensorData, SENSOR_INTERVAL);
}


/**
* @name _initBackgroundSync
* @description Initialises background sync with sensors and database
* @author Antero Hanhirova
*/

function _initBackgroundSync() {
  background.openConnection(function( result ){
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

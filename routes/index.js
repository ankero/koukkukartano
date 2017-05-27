var express = require('express');
var background = require('./background');
var bridge = require('./bridge');
var router = express.Router();


/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});


function _saveToDb( sensorData ) {
  var payload = {
    timestamp: new Date().getTime(),
    data: sensorData
  };
  console.log(payload.timestamp);
  background.put( payload );
}

function _getSensorData() {
  bridge.getSensorData(function(sensorData, result){
    if ( !Array.isArray( sensorData ) ) {
      console.error("Error getting sensor read.");
    } else {
      _saveToDb(sensorData);
    }
  });
}

function _startInterval() {
  setInterval(_getSensorData, 10000);
}


// Open connection to Firebase
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

module.exports = router;

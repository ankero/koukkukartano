var express = require('express');
var background = require('./background');
var bridge = require('./bridge');
var router = express.Router();


/* GET home page. */

router.get('/', function(req, res) {
  res.render('index', { title: 'Express' });
});

// Open connection to Firebase
background.openConnection(function(){

  // Get sensor data
  bridge.getSensorData(function(sensorData){
    console.log(sensorData);
  });
});

module.exports = router;

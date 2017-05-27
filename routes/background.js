var firebase = require("firebase-admin");
var serviceAccount = require("../keys.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://koukkukartano-91a94.firebaseio.com"
});

var SENSOR_REF = 'sensor_data';
var LIGHT_REF = 'light_data';
var USER_REF = 'users';
var MAX_HISTORY_ITEMS = 2;
var DB_STATUS;
var sensorConnection,
    lightConnection;

exports.openConnections = function( fn ) {
  sensorConnection = firebase.database().ref(SENSOR_REF);
  lightConnection = firebase.database().ref(LIGHT_REF);

  console.log("Connecting Firebase...");
  sensorConnection.limitToLast(MAX_HISTORY_ITEMS).on('value', function(dataSnapshot) {


    if ( typeof DB_STATUS === 'undefined' ) {
      // First connection test

      if ( dataSnapshot.val() ) {
        DB_STATUS = true;
        return fn({success:true});
      } else {
        DB_STATUS = false;
        return fn({success:false});
      }
    } else {
      // Runtime connection test

      if ( dataSnapshot.val() ) {
        DB_STATUS = true;
      } else {
        console.log("Connection to db lost.. idling until reconnected.");
        DB_STATUS = false;
      }
    }
  });
};

exports.putSensorData = function(data) {
  if ( DB_STATUS !== false ) {
    sensorConnection.push( data );
  }
};

exports.putLightData = function(data) {
  if ( DB_STATUS !== false ) {
    lightConnection.push( data );
  }
};

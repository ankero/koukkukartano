var firebase = require("firebase-admin");
var serviceAccount = require("../keys.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://koukkukartano-91a94.firebaseio.com"
});

var SENSOR_REF = 'sensor_data';
var USER_REF = 'users';
var MAX_HISTORY_ITEMS = 2;
var DB_STATUS;
var db;

exports.openConnection = function( fn ) {
  db = firebase.database().ref(SENSOR_REF);
  console.log("Connecting Firebase...");
  db.limitToLast(MAX_HISTORY_ITEMS).on('value', function(dataSnapshot) {


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

exports.put = function(data) {
  if ( DB_STATUS !== false ) {
    db.push( data );
  }
};

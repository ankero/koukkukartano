var firebase = require("firebase-admin");
var serviceAccount = require("../keys.json");

firebase.initializeApp({
  credential: firebase.credential.cert(serviceAccount),
  databaseURL: "https://koukkukartano-91a94.firebaseio.com"
});

var MAX_HISTORY_ITEMS = 5;
var db;


exports.openConnection = function( fn ) {
  db = firebase.database().ref("sensorData");
  console.log("Connection to Firebase...");
  db.limitToLast(MAX_HISTORY_ITEMS).on('value', function(dataSnapshot) {
    var items = [];
    dataSnapshot.forEach(function(childSnapshot) {
      var item = childSnapshot.val();
      items.push(item);
    });
    if ( items.length === MAX_HISTORY_ITEMS ) {
      console.log("Connection successfull");
    } else {
      console.log("Connection not working properly, or empty data.");
    }

    return fn();
  });
};

exports.put = function(data) {
  db.push( data );
};

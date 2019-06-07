const functions = require('firebase-functions');
const admin = require('firebase-admin');
const serviceAccount = require('./ServiceAccountKey.json');

admin.initializeApp({
 credential: admin.credential.cert(serviceAccount)
}); // Initialize the admin sdk before it use.

exports.onBostonWeatherUpdate = functions.firestore
   .document('cities-weather/boston-ma-us')
   .onUpdate(change => {
     const afterUpdate = change.after.data() || {}; // This give the JS object once the data on the specified doc got changed.
     const payload = {
      data: {
       temp: String(afterUpdate.temp), // It requires to have any other data formats to be in String format for FCM (Firebase Cloud Messaging).
       conditions: afterUpdate.conditions
      }
     };

     return admin.messaging().sendToTopic("weather_boston_ma_ua", payload).catch(err => {
      console.error(`Error while sending the FCM. Error: ${err}`)
     });
});

exports.getBostonWeather = functions.https
 .onRequest(async (request, response) => {
  try {
   const snapshot = await admin.firestore().doc('cities-weather/boston-ma-us').get();
   const data = snapshot.data(); // Javascript object
   return response.send(data); // response object knows how to do the conversion from JS object to JSON strings.
  } catch (e) {
   const errorMessage = `Error occurred. Due to : ${err}`;
   console.error(errorMessage);
   return response.status(500).send(errorMessage);
  }
});

exports.helloWorld = functions.https
  .onRequest((request, response) => {
    response.send("Hello from Firebase!");
});

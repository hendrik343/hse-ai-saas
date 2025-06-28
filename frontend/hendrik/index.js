const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Função HTTP de teste
exports.helloWorld = functions.https.onRequest((req, res) => {
  res.status(200).send("✅ API online! Função helloWorld está a funcionar.");
}); 
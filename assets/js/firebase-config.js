var firebaseConfig = {
  apiKey: "AIzaSyCnwj8_TbiB2Lmq0Ybq152t5ci7_SkZMPg",
  authDomain: "naiwrist-watches.firebaseapp.com",
  projectId: "naiwrist-watches",
  storageBucket: "naiwrist-watches.firebasestorage.app",
  messagingSenderId: "388253483110",
  appId: "1:388253483110:web:c4b57d8e93376e733feda7"
};

firebase.initializeApp(firebaseConfig);
var db = firebase.firestore();
var auth = firebase.auth();

if (typeof location !== 'undefined' && location.hostname === 'localhost') {
  db.useEmulator('localhost', 8080);
}

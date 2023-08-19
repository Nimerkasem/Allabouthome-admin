import firebase from "firebase/compat/app";
import "firebase/compat/firestore";
import "firebase/compat/auth";
import "firebase/compat/storage";


// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyC8M60IxRcZFla6Nov-kvDsIELOu7qDntU",
    authDomain: "all-about-home-1ad85.firebaseapp.com",
    databaseURL: "https://all-about-home-1ad85-default-rtdb.firebaseio.com",
    projectId: "all-about-home-1ad85",
    storageBucket: "all-about-home-1ad85.appspot.com",
    messagingSenderId: "255829800883",
    appId: "1:255829800883:web:143628fad0b11d36733dc6",
    measurementId: "G-46JKKRDJYH"
  };
firebase.initializeApp(firebaseConfig);

export default firebase;

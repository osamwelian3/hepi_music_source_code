// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import {
    getFirestore
} from "firebase/firestore";
import { getDatabase } from "firebase/database";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyDW8jrSbbxaa1BZx8KqIduJkDuo7X9HfJw",
    authDomain: "storage-urli.firebaseapp.com",
    databaseURL: "https://storage-urli-default-rtdb.europe-west1.firebasedatabase.app",
    projectId: "storage-urli",
    storageBucket: "storage-urli.appspot.com",
    messagingSenderId: "55593132691",
    appId: "1:55593132691:web:309c973bfed7d9f8362366"
};

const firebaseConfig2 = {
  apiKey: "AIzaSyDJzZR1b4o5pnBWEGxsbZ5roSb0J21v9vM",
  authDomain: "hepi-music-dev.firebaseapp.com",
  databaseURL: "https://hepi-music-dev-default-rtdb.firebaseio.com",
  projectId: "hepi-music-dev",
  storageBucket: "hepi-music-dev.appspot.com",
  messagingSenderId: "471642134939",
  appId: "1:471642134939:web:5c2589a789adab3bf7693e",
  measurementId: "G-TTYVEYW544"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);

const auth = getAuth(firebaseApp);
export { auth };
const db = getFirestore(firebaseApp);
export { db }
const storage = getStorage(firebaseApp)
export { storage }
const database = getDatabase(firebaseApp);
export { database }

export { firebaseApp };

// Initialize Firebase 2
const firebaseApp2 = initializeApp(firebaseConfig2, "hepiDev");

const auth2 = getAuth(firebaseApp2);
export { auth2 };
const db2 = getFirestore(firebaseApp2);
export { db2 }
const storage2 = getStorage(firebaseApp2)
export { storage2 }
const database2 = getDatabase(firebaseApp2);
export { database2 }

export { firebaseApp2 };
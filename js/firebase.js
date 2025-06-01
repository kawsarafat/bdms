// js/firebase.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyDRqfbe70wWScpNUy3hVQkoldKZBLnjRdQ",
  authDomain: "blood-donor-management-s-4dc81.firebaseapp.com",
  projectId: "blood-donor-management-s-4dc81",
  storageBucket: "blood-donor-management-s-4dc81.appspot.com",
  messagingSenderId: "638919394599",
  appId: "1:638919394599:web:fb2517abb596ea8a7b1502",
  measurementId: "G-YKXW6C3QMK"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firestore and Auth
const db = getFirestore(app);
const auth = getAuth(app);

export { db, auth };

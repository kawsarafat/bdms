// js/form.js
import { db } from "./firebase.js";
import {
  addDoc,
  collection,
  getDocs,
  query,
  where
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const donorForm = document.getElementById("donorForm");

donorForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = document.getElementById("name").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const location = document.getElementById("location").value.trim();
  const blood = document.getElementById("blood").value;
  const adminSlug = new URLSearchParams(window.location.search).get("admin");

  if (!adminSlug) {
    alert("Invalid admin link!");
    return;
  }

  const q = query(collection(db, "users"), where("slug", "==", adminSlug));
  const querySnapshot = await getDocs(q);
  if (querySnapshot.empty) {
    alert("Invalid admin!");
    return;
  }

  const adminUid = querySnapshot.docs[0].id;

  await addDoc(collection(db, "donors"), {
    name,
    phone,
    location,
    blood,
    adminUid,
    status: "pending"
  });

  alert("Donor information submitted successfully!");
  donorForm.reset();
});

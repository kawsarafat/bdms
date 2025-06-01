// js/publicList.js
import { db } from "./firebase.js";
import {
  collection,
  query,
  where,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const donorList = document.getElementById("donorList");
const adminSlug = window.location.pathname.split("/").pop().replace(".html", "");

async function loadDonors() {
  const q = query(collection(db, "users"), where("slug", "==", adminSlug));
  const querySnapshot = await getDocs(q);

  if (querySnapshot.empty) {
    donorList.innerHTML = "<li>Admin not found.</li>";
    return;
  }

  const adminUid = querySnapshot.docs[0].id;

  const donorQuery = query(
    collection(db, "donors"),
    where("adminUid", "==", adminUid),
    where("status", "==", "approved")
  );

  const donorsSnap = await getDocs(donorQuery);
  donorList.innerHTML = "";

  if (donorsSnap.empty) {
    donorList.innerHTML = "<li>No donors found.</li>";
    return;
  }

  donorsSnap.forEach(docSnap => {
    const donor = docSnap.data();
    const li = document.createElement("li");
    li.textContent = `${donor.name} (${donor.blood}) – ${donor.location}`;
    donorList.appendChild(li);
  });
}

loadDonors();

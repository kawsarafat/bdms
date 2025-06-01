// js/dashboard.js
import { auth, db } from "./firebase.js";
import {
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  doc,
  getDoc,
  updateDoc,
  collection,
  query,
  where,
  onSnapshot,
  setDoc,
  addDoc,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// DOM Elements
const adminName = document.getElementById("adminName");
const adminSlug = document.getElementById("adminSlug");
const newSlug = document.getElementById("newSlug");
const updateSlugBtn = document.getElementById("updateSlugBtn");
const logoutBtn = document.getElementById("logoutBtn");
const pendingList = document.getElementById("pendingList");
const approvedList = document.getElementById("approvedList");
const formLink = document.getElementById("formLink");
const listLink = document.getElementById("listLink");

const manualForm = document.getElementById("manualDonorForm");
const manualName = document.getElementById("manualName");
const manualLocation = document.getElementById("manualLocation");
const manualPhone = document.getElementById("manualPhone");
const manualBlood = document.getElementById("manualBlood");

let currentUser;
let userData;

// Auth listener
onAuthStateChanged(auth, async (user) => {
  if (!user) {
    window.location.href = "login.html";
    return;
  }

  currentUser = user;

  const docRef = doc(db, "users", user.uid);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    userData = docSnap.data();
    adminName.textContent = userData.name;
    adminSlug.textContent = userData.slug;

    updateLinks(userData.slug);
    loadPendingDonors();
    loadApprovedDonors();
  }
});

// Update slug
updateSlugBtn.addEventListener("click", async () => {
  const newSlugValue = newSlug.value.trim();
  if (!newSlugValue) return;

  await updateDoc(doc(db, "users", currentUser.uid), {
    slug: newSlugValue
  });
  adminSlug.textContent = newSlugValue;
  updateLinks(newSlugValue);
  alert("Slug updated!");
});

// Logout
logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

// Generate form and list links
function updateLinks(slug) {
  formLink.href = `/public/form.html?admin=${slug}`;
  formLink.textContent = `${window.location.origin}/public/form.html?admin=${slug}`;

  listLink.href = `/public/u/${slug}.html`;
  listLink.textContent = `${window.location.origin}/public/u/${slug}.html`;
}

// Load pending donors
function loadPendingDonors() {
  const q = query(
    collection(db, "donors"),
    where("adminUid", "==", currentUser.uid),
    where("status", "==", "pending")
  );

  onSnapshot(q, (snapshot) => {
    pendingList.innerHTML = "";
    if (snapshot.empty) {
      pendingList.innerHTML = "<li>No pending donors.</li>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const donor = docSnap.data();
      const li = document.createElement("li");
      li.innerHTML = `
        ${donor.name} (${donor.blood}) 
        <button onclick="approveDonor('${docSnap.id}')">Approve</button>
        <button onclick="deleteDonor('${docSnap.id}')">Delete</button>
      `;
      pendingList.appendChild(li);
    });
  });
}

// Load approved donors
function loadApprovedDonors() {
  const q = query(
    collection(db, "donors"),
    where("adminUid", "==", currentUser.uid),
    where("status", "==", "approved")
  );

  onSnapshot(q, (snapshot) => {
    approvedList.innerHTML = "";
    if (snapshot.empty) {
      approvedList.innerHTML = "<li>No approved donors.</li>";
      return;
    }

    snapshot.forEach((docSnap) => {
      const donor = docSnap.data();
      const li = document.createElement("li");
      li.textContent = `${donor.name} (${donor.blood}) – ${donor.location}`;
      approvedList.appendChild(li);
    });
  });
}

// Approve donor
window.approveDonor = async (id) => {
  await updateDoc(doc(db, "donors", id), {
    status: "approved"
  });
};

// Delete donor
window.deleteDonor = async (id) => {
  if (confirm("Are you sure you want to delete this donor?")) {
    await deleteDoc(doc(db, "donors", id));
  }
};

// Manually add donor
manualForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const name = manualName.value.trim();
  const phone = manualPhone.value.trim();
  const location = manualLocation.value.trim();
  const blood = manualBlood.value;

  if (!name || !phone || !location || !blood) {
    alert("Please fill all fields");
    return;
  }

  await addDoc(collection(db, "donors"), {
    name,
    phone,
    location,
    blood,
    adminUid: currentUser.uid,
    status: "approved"
  });

  alert("Donor added successfully!");
  manualForm.reset();
});

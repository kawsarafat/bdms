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
  deleteDoc
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

const adminName = document.getElementById("adminName");
const adminSlug = document.getElementById("adminSlug");
const newSlug = document.getElementById("newSlug");
const updateSlugBtn = document.getElementById("updateSlugBtn");
const logoutBtn = document.getElementById("logoutBtn");
const pendingList = document.getElementById("pendingList");
const approvedList = document.getElementById("approvedList");

let currentUser;
let userData;

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

    loadPendingDonors();
    loadApprovedDonors();
  }
});

updateSlugBtn.addEventListener("click", async () => {
  const newSlugValue = newSlug.value.trim();
  if (!newSlugValue) return;

  await updateDoc(doc(db, "users", currentUser.uid), {
    slug: newSlugValue
  });
  adminSlug.textContent = newSlugValue;
  alert("Slug updated!");
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
  window.location.href = "login.html";
});

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
      li.innerHTML = `${donor.name} (${donor.blood})`;
      approvedList.appendChild(li);
    });
  });
}

window.approveDonor = async (id) => {
  await updateDoc(doc(db, "donors", id), {
    status: "approved"
  });
};

window.deleteDonor = async (id) => {
  if (confirm("Are you sure you want to delete this donor?")) {
    await deleteDoc(doc(db, "donors", id));
  }
};

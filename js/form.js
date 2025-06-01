// js/form.js
import { db } from './firebase.js';
import { collection, addDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.0/firebase-firestore.js";

// Extract slug from URL path (e.g. /kawsar -> "kawsar")
const slug = window.location.pathname.split('/')[1] || 'default';

document.getElementById('donorForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const form = e.target;
  const name = form.name.value.trim();
  const blood = form.blood.value.trim().toUpperCase();
  const district = form.district.value.trim();
  const phone = form.phone.value.trim();

  if (!name || !blood || !district || !phone) {
    alert("Please fill in all fields.");
    return;
  }

  try {
    await addDoc(collection(db, `donors_pending_${slug}`), {
      name,
      blood,
      district,
      phone,
      createdAt: serverTimestamp()
    });
    alert("Thank you! Your request has been submitted for review.");
    form.reset();
  } catch (error) {
    console.error("Error submitting donor:", error);
    alert("Error submitting. Please try again.");
  }
});

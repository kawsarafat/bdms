// js/dashboard.js
import { auth, db, logout, getAdminData, addManualDonor, approveDonor, fetchDonors } from './firebase.js';

document.addEventListener("DOMContentLoaded", () => {
  const tabs = document.querySelectorAll(".sidebar-nav li");
  const sections = document.querySelectorAll(".tab");

  // Sidebar Tab Switching
  tabs.forEach(tab => {
    tab.addEventListener("click", () => {
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");
      sections.forEach(sec => sec.classList.remove("active"));
      document.getElementById(`tab-${tab.dataset.tab}`).classList.add("active");
    });
  });

  // Logout
  document.getElementById("logoutBtn").addEventListener("click", async () => {
    await logout();
    window.location.href = "login.html";
  });

  // Load Admin Info
  auth.onAuthStateChanged(async user => {
    if (user) {
      const adminEmail = document.getElementById("adminEmail");
      adminEmail.textContent = user.email;
      const adminData = await getAdminData(user.uid);
      const slug = adminData.slug;

      document.getElementById("formLink").textContent = `${window.location.origin}/form.html?slug=${slug}`;
      document.getElementById("publicLink").textContent = `${window.location.origin}/index.html?slug=${slug}`;

      // Load donor data
      fetchDonors(user.uid, true); // approved
      fetchDonors(user.uid, false); // pending
    } else {
      window.location.href = "login.html";
    }
  });

  // Copy Links
  window.copyLink = function (id) {
    const text = document.getElementById(id).textContent;
    navigator.clipboard.writeText(text).then(() => {
      alert("Link copied!");
    });
  };

  // Manual Donor Form
  document.getElementById("manualDonorForm").addEventListener("submit", async e => {
    e.preventDefault();
    const form = e.target;
    const donor = {
      name: form.name.value,
      blood: form.blood.value,
      district: form.district.value,
      phone: form.phone.value,
      approved: true,
      createdAt: Date.now()
    };
    const user = auth.currentUser;
    await addManualDonor(user.uid, donor);
    alert("Donor added!");
    form.reset();
    fetchDonors(user.uid, true);
  });

  // Settings form
  document.getElementById("settingsForm").addEventListener("submit", async e => {
    e.preventDefault();
    const slug = e.target.slug.value.trim();
    if (!slug) return;
    const user = auth.currentUser;
    await db.collection("admins").doc(user.uid).update({ slug });
    alert("Slug updated!");
    location.reload();
  });
});

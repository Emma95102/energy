// firebase.js － 給純 HTML 用的 CDN 版本 + 除錯寫入

import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  increment,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

// === 你的 Firebase 設定 ===
const firebaseConfig = {
  apiKey: "AIzaSyC1j-dOgTlBdQR3Tpt5KehghPJfbRblcpM",
  authDomain: "energy-e1c4b.firebaseapp.com",
  projectId: "energy-e1c4b",
  storageBucket: "energy-e1c4b.firebasestorage.app",
  messagingSenderId: "349372717450",
  appId: "1:349372717450:web:161ebc5b0066a4acc89073"
};

// 初始化 Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 掛到全域，給其他 JS 用
window.firebaseDB = db;
window.firebaseAuth = auth;
window.GoogleAuthProvider = GoogleAuthProvider;
window.signInWithPopup = signInWithPopup;
window.onAuthStateChanged = onAuthStateChanged;

window.firestore = {
  doc,
  setDoc,
  getDoc,
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  increment,
  getDocs,
  orderBy,
  query,
  limit,
  startAfter
};

console.log("✅ Firebase 初始化完成");

// === 除錯：載入 firebase.js 就自動寫一筆資料到 Firestore ===
(async () => {
  try {
    await setDoc(
      doc(db, "debug", "test"),
      {
        from: "firebase.js",
        writtenAt: serverTimestamp()
      },
      { merge: true }
    );
    console.log("✅ debug/test 已寫入 Firestore");
  } catch (err) {
    console.error("❌ 寫入 debug/test 失敗：", err);
  }
})();

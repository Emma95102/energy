import "./firebase.js";

const auth = window.firebaseAuth;
const db = window.firebaseDB;
const { doc, setDoc, getDoc, addDoc, collection, serverTimestamp, updateDoc, increment } = window.firestore;

let currentUser = null;

window.onAuthStateChanged(auth, async (user) => {
  if (!user) {
    alert("請先登入才能使用行為表！");
    window.location.href = "home.html";
    return;
  }
  currentUser = user;
  console.log("登入使用者：", user.displayName);
});

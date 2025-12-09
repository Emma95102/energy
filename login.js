document.getElementById("google-login").addEventListener("click", login);

async function login() {
  const auth = window.firebaseAuth;
  const provider = new window.GoogleAuthProvider();

  try {
    const result = await window.signInWithPopup(auth, provider);
    const user = result.user;

    // ===== Firebase 建立使用者文件 =====
    await window.firestore.setDoc(
      window.firestore.doc(window.db, "users", user.uid),
      {
        displayName: user.displayName,
        email: user.email,
        medals: 0,
        updatedAt: window.firestore.serverTimestamp()
      },
      { merge: true }
    );

    alert("登入成功：" + user.displayName);
    window.location.href = "home.html";

  } catch (err) {
    console.error("登入失敗：", err);
    alert("登入失敗：" + err.message);
  }
}

// ===== 自動登入檢查（避免已登入卻還停在 login 頁）=====
window.onAuthStateChanged(window.firebaseAuth, (user) => {
  if (user) {
    window.location.href = "home.html";
  }
});

// 這個檔案專門負責：
// 1. 把「行為表」的今日紀錄寫入 Firestore
// 2. 同時建立 users / dailyRecords / history 結構

// 從 firebase.js 暴露出來的全域物件
const db = window.firebaseDB;
const { doc, setDoc, addDoc, collection, serverTimestamp } = window.firestore;

// 取得登入的「使用者名稱」（目前仍用 localStorage）
function getUsername() {
  const name = localStorage.getItem("username");
  return name ? name.trim() : "";
}

// 綁定「儲存今天的紀錄」按鈕
const saveBtn = document.getElementById("save-btn");
if (saveBtn) {
  saveBtn.addEventListener("click", saveTodayToFirebase);
}

async function saveTodayToFirebase() {
  const username = getUsername();
  if (!username) {
    alert("找不到使用者名稱，請先回登入頁重新登入一次。");
    return;
  }

  // 取得今天日期（YYYY-MM-DD）
  const today = new Date().toISOString().split("T")[0];

  // 讀取畫面上的今日得分與備註
  const pointsEl = document.getElementById("today-points");
  const noteEl = document.getElementById("note");

  const points = pointsEl ? Number(pointsEl.textContent || "0") : 0;
  const note = noteEl ? noteEl.value || "" : "";

  try {
    // 0. 建立 / 更新 users 主文件（以 username 當作 uid）
    await setDoc(
      doc(db, "users", username),
      {
        displayName: username,
        updatedAt: serverTimestamp()
      },
      { merge: true }
    );

    // 1. 寫入每日紀錄：users/{username}/dailyRecords/{today}
    await setDoc(
      doc(db, "users", username, "dailyRecords", today),
      {
        date: today,
        points: points,
        note: note,
        savedAt: serverTimestamp()
      },
      { merge: true }
    );

    // 2. 寫入歷史紀錄：users/{username}/history/{autoId}
    await addDoc(
      collection(db, "users", username, "history"),
      {
        date: today,
        points: points,
        note: note,
        action: "save_daily",
        createdAt: serverTimestamp()
      }
    );

    console.log("✅ 已寫入 Firebase");
    // 這裡不 alert，避免跟原本 behavior.js 的提示打架
  } catch (err) {
    console.error("寫入 Firebase 失敗：", err);
    alert("寫入 Firebase 失敗，請看 console 錯誤訊息。");
  }
}

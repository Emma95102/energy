// -----------------------------
// 原本前端行為邏輯（保留）
// -----------------------------
const taskListEl = document.getElementById("task-list");
const noteEl = document.getElementById("note");
const saveBtn = document.getElementById("save-btn");
const todayPointsEl = document.getElementById("today-points");
const weekPointsEl = document.getElementById("week-points");
const weekPointsEl2 = document.getElementById("week-points-2");
const weeklyGoalLabel = document.getElementById("weekly-goal-label");
const weeklyGoalLabel2 = document.getElementById("weekly-goal-2");
const track = document.getElementById("track");
const walker = document.getElementById("walker");
const medalNote = document.getElementById("medal-note");
const saveSound = document.getElementById("save-sound");

weeklyGoalLabel.textContent = WEEKLY_GOAL;
weeklyGoalLabel2.textContent = WEEKLY_GOAL;

renderTasks();
updatePoints();
renderWalker();

function renderTasks() {
  taskListEl.innerHTML = "";
  TASKS.forEach((t, idx) => {
    const doneToday = store.tasksDone[idx] === getToday();
    const div = document.createElement("div");
    div.className = "task";

    const left = document.createElement("div");
    left.innerHTML = `
      <div class="name">${t.name}</div>
      <div class="points small muted">${t.points} 點</div>
    `;

    const btn = document.createElement("button");
    btn.textContent = doneToday ? "已完成" : `+${t.points}`;
    if (doneToday) btn.disabled = true;
    btn.addEventListener("click", () => markTask(idx));

    div.appendChild(left);
    div.appendChild(btn);

    taskListEl.appendChild(div);
  });
}

function markTask(idx) {
  const t = TASKS[idx];

  if (store.tasksDone[idx] === getToday()) return;
  if (store.weeklyTotal + t.points > WEEKLY_GOAL) {
    alert(`加上此項目會超過本週上限 ${WEEKLY_GOAL} 點`);
    return;
  }

  store.tasksDone[idx] = getToday();
  store.weeklyTotal += t.points;

  saveStore();
  renderTasks();
  updatePoints();
  renderWalker();
}

function updatePoints() {
  const today = getToday();
  const todayPoints = Object.keys(store.tasksDone).reduce(
    (s, k) => (store.tasksDone[k] === today ? s + TASKS[k].points : s),
    0
  );

  todayPointsEl.textContent = todayPoints;
  weekPointsEl.textContent = store.weeklyTotal;
  weekPointsEl2.textContent = store.weeklyTotal;
}

function renderWalker() {
  const trackWidth = Math.max(track.clientWidth - 48, 24);
  const ratio = Math.min(store.weeklyTotal / WEEKLY_GOAL, 1);
  walker.style.left = 8 + Math.round(ratio * trackWidth) + "px";
}

// -----------------------------
// 🔥 Firebase：寫入使用者今日紀錄
// -----------------------------

// 取用 firebase.js 公開出來的全域變數
const db = window.firebaseDB;
const { doc, setDoc, addDoc, collection, serverTimestamp } = window.firestore;

// 取得登入使用者名稱
function getUsername() {
  const name = localStorage.getItem("username");
  return name ? name.trim() : "";
}

// 綁定儲存按鈕
saveBtn.addEventListener("click", saveTodayRecord);


async function saveTodayRecord() {
  const today = getToday();

  // 蒐集今日任務（原有邏輯）
  const actions = Object.keys(store.tasksDone)
    .filter((i) => store.tasksDone[i] === today)
    .map(Number);

  const points = actions.reduce((s, i) => s + TASKS[i].points, 0);
  const note = noteEl.value.trim();

  // ------------------------
  // 1️⃣ 本地先存（保留）
  // ------------------------
  store.history.unshift({
    date: today,
    actions,
    points,
    note,
    timestamp: new Date().toISOString(),
  });
  saveStore();

  // 播放音效
  try {
    saveSound.currentTime = 0;
    saveSound.play();
  } catch (e) {}

  updatePoints();
  renderWalker();

  // ------------------------
  // 2️⃣ Firebase 保存（新增部分）
  // ------------------------
  const username = getUsername();
  if (!username) {
    alert("找不到使用者名稱。請重新登入！");
    return;
  }

  try {
    // 2-1. 建立 / 更新使用者主文件
    await setDoc(
      doc(db, "users", username),
      {
        displayName: username,
        updatedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 2-2. 寫入每日紀錄
    await setDoc(
      doc(db, "users", username, "dailyRecords", today),
      {
        date: today,
        actions,
        points,
        note,
        savedAt: serverTimestamp(),
      },
      { merge: true }
    );

    // 2-3. 寫入歷史紀錄（autoId）
    await addDoc(collection(db, "users", username, "history"), {
      date: today,
      actions,
      points,
      note,
      type: "daily_save",
      createdAt: serverTimestamp(),
    });

    alert("（Firebase）今日紀錄已成功寫入！");
    console.log("🔥 Firebase 寫入成功");

  } catch (err) {
    console.error("🔥 Firebase 寫入失敗：", err);
    alert("寫入 Firebase 時發生錯誤，請查看 Console 錯誤訊息！");
  }
}

const historyListEl = document.getElementById("history-list");
const todayPointsEl = document.getElementById("today-points");
const weekPointsEl = document.getElementById("week-points");
const weekPointsEl2 = document.getElementById("week-points-2");
const track = document.getElementById("track");
const walker = document.getElementById("walker");
const medalNote = document.getElementById("medal-note");
const saveSound = document.getElementById("save-sound");

let currentPage = 1;
const PAGE_SIZE = 8;

function renderHistoryPage(page = 1){
  const list = store.history || [];
  historyListEl.innerHTML = "";
  const totalPages = Math.max(1, Math.ceil(list.length / PAGE_SIZE));
  currentPage = Math.min(Math.max(1,page), totalPages);
  const slice = list.slice((currentPage-1)*PAGE_SIZE, currentPage*PAGE_SIZE);
  if(slice.length===0){ historyListEl.innerHTML = "<p class='muted'>尚無歷史紀錄</p>"; }
  else{
    slice.forEach(item=>{
      const div = document.createElement("div");
      div.className = "history-item";
      const names = item.actions.map(i=>TASKS[i].name).join("、") || "（無）";
      div.innerHTML = `<div class="date">${item.date} — ${item.points} 點</div>
                       <div class="muted">行為：${names}</div>
                       <div class="muted">備註：${item.note||"（無）"}</div>`;
      historyListEl.appendChild(div);
    });
  }
  document.getElementById("page-info").textContent = `第 ${currentPage} 頁 / ${totalPages} 頁`;
  document.getElementById("prev-page").disabled = currentPage<=1;
  document.getElementById("next-page").disabled = currentPage>=totalPages;
}

// ----- 確保今天的紀錄存入 history -----
function ensureTodayInHistory() {
  // ⭐ 關鍵修正: 在檢查前，先呼叫 main.js 的函數，確保 store.today 是最新狀態
  if (window.initializeTodayStore) {
    window.initializeTodayStore();
  }
  
  const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
  const list = store.history || [];

  // 直接從 store.today 取得最新資料
  const points = store.today?.points || 0;
  const actions = store.today?.actions || [];
  // 備註應只在 behavior 頁面更新，或使用歷史紀錄中今天的備註，但為了簡化，在此使用 store.today 中的備註
  const note = store.today?.note || ""; 


  // 如果今天完全沒有資料就不處理
  if (points === 0 && actions.length === 0 && !note) {
    return;
  }

  // 找今天的紀錄索引
  const todayIndex = list.findIndex(item => item.date === today);
  
  // 今天的記錄物件
  const todayRecord = { date: today, points: points, actions: actions, note: note };

  if (todayIndex >= 0) {
    // 已存在今天的紀錄 → 更新它
    list[todayIndex] = todayRecord;
  } else {
    // 不存在今天的紀錄 → 新增在最前面
    list.unshift(todayRecord);
  }

  store.history = list;
  localStorage.setItem("energy_tracker_v4", JSON.stringify(store));
}

// 每次載入頁面時執行
ensureTodayInHistory();

// 綁定儲存按鈕
document.getElementById("save-btn")?.addEventListener("click", ()=> {
  // 使用 main.js 的 saveToday 函數 (它會負責更新 store.today 和 history)
 if (window.saveToday) {
     window.saveToday();
  }
  
  // 重新渲染頁面
  renderHistoryPage(currentPage);
  
  // 播放儲存音效 (如果有的話)
  const saveSound = document.getElementById("save-sound");
  if (saveSound) {
     saveSound.currentTime = 0;
     saveSound.play();
  }
});

document.getElementById("prev-page")?.addEventListener("click", ()=> renderHistoryPage(currentPage-1));
document.getElementById("next-page")?.addEventListener("click", ()=> renderHistoryPage(currentPage+1));

renderHistoryPage();
updatePoints();
renderWalker();
const medalListEl = document.getElementById("medal-list");

function renderMedalsPage(){
  medalListEl.innerHTML = "";
  if(!store.medals || store.medals.length===0){ 
    medalListEl.innerHTML = "<p class='muted'>尚未取得任何獎牌</p>"; 
    return;
  }
  store.medals.forEach(m=>{
    const div = document.createElement("div");
    div.className = "history-item";
    div.innerHTML = `<div class='date'>🏅 ${m.date}</div>
                     <div class='muted'>該週累積 ${m.points} 點</div>
                     <div class='muted'>💬 恭喜你，本週已成功達成 ${m.points} 點！ ${m.message || '繼續保持節能好習慣！'}</div>`;
    medalListEl.appendChild(div);
  });
}

renderMedalsPage();
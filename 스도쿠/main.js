const $ = s => document.querySelector(s);
const gridEl = $('#grid'), msgEl = $('#msg');

let solution, board, fixed, sel = -1, secs = 0, timer = null, wrong = new Set(), done = false;

/* ---------- 퍼즐 생성 ---------- */
function candidates(b, i) {
  const r = Math.floor(i / 9), c = i % 9, used = new Set();
  for (let k = 0; k < 9; k++) { used.add(b[r * 9 + k]); used.add(b[k * 9 + c]); }
  const br = r - r % 3, bc = c - c % 3;
  for (let a = 0; a < 3; a++) for (let d = 0; d < 3; d++) used.add(b[(br + a) * 9 + bc + d]);
  return [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(n => !used.has(n));
}

function shuffle(a) {
  for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; }
  return a;
}

function fill(b) {
  const i = b.indexOf(0);
  if (i < 0) return true;
  for (const v of shuffle(candidates(b, i))) { b[i] = v; if (fill(b)) return true; }
  b[i] = 0; return false;
}

// 해의 개수를 limit까지 센다
function countSolutions(b, limit) {
  let best = -1, bc = null;
  for (let i = 0; i < 81; i++) {
    if (b[i]) continue;
    const cs = candidates(b, i);
    if (!cs.length) return 0;
    if (!bc || cs.length < bc.length) { best = i; bc = cs; if (cs.length === 1) break; }
  }
  if (best < 0) return 1;
  let n = 0;
  for (const v of bc) { b[best] = v; n += countSolutions(b, limit - n); if (n >= limit) break; }
  b[best] = 0; return n;
}

function newGame() {
  clearInterval(timer);
  solution = Array(81).fill(0); fill(solution);
  board = solution.slice();
  let target = +$('#level').value, removed = 0;
  for (const i of shuffle([...Array(81).keys()])) {
    if (removed >= target) break;
    const v = board[i]; board[i] = 0;
    if (countSolutions(board.slice(), 2) === 1) removed++; else board[i] = v;
  }
  fixed = board.map(v => v !== 0);
  sel = -1; secs = 0; wrong.clear(); done = false; msgEl.textContent = '';
  timer = setInterval(() => { secs++; $('#time').textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0'); }, 1000);
  $('#time').textContent = '0:00';
  render();
}

/* ---------- 화면 ---------- */
function conflicts(i) {
  const v = board[i]; if (!v) return false;
  const r = Math.floor(i / 9), c = i % 9;
  for (let j = 0; j < 81; j++) {
    if (j === i || board[j] !== v) continue;
    const jr = Math.floor(j / 9), jc = j % 9;
    if (jr === r || jc === c || (Math.floor(jr / 3) === Math.floor(r / 3) && Math.floor(jc / 3) === Math.floor(c / 3))) return true;
  }
  return false;
}

function render() {
  gridEl.innerHTML = '';
  const sr = Math.floor(sel / 9), sc = sel % 9;
  for (let i = 0; i < 81; i++) {
    const d = document.createElement('div');
    d.className = 'cell';
    d.textContent = board[i] || '';
    if (fixed[i]) d.classList.add('fixed');
    if (sel >= 0) {
      const r = Math.floor(i / 9), c = i % 9;
      if (i === sel) d.classList.add('sel');
      else if (board[sel] && board[i] === board[sel]) d.classList.add('same');
      else if (r === sr || c === sc || (Math.floor(r / 3) === Math.floor(sr / 3) && Math.floor(c / 3) === Math.floor(sc / 3))) d.classList.add('peer');
    }
    if (!fixed[i] && conflicts(i)) d.classList.add('bad');
    if (wrong.has(i)) d.classList.add('wrong');
    d.onclick = () => { sel = i; render(); };
    gridEl.appendChild(d);
  }
  if (!done && board.every((v, i) => v === solution[i])) {
    done = true; clearInterval(timer); msgEl.textContent = '🎉 완성!';
  }
}

function setValue(v) {
  if (done || sel < 0 || fixed[sel]) return;
  board[sel] = v; wrong.clear(); msgEl.textContent = ''; render();
}

/* ---------- 입력 ---------- */
const pad = $('#pad');
for (let n = 1; n <= 9; n++) { const b = document.createElement('button'); b.textContent = n; b.onclick = () => setValue(n); pad.appendChild(b); }
const er = document.createElement('button'); er.textContent = '⌫'; er.onclick = () => setValue(0); pad.appendChild(er);

document.addEventListener('keydown', e => {
  if (e.key >= '1' && e.key <= '9') setValue(+e.key);
  else if (e.key === 'Backspace' || e.key === 'Delete' || e.key === '0') setValue(0);
  else if (e.key.startsWith('Arrow')) {
    if (sel < 0) sel = 0;
    else {
      const r = Math.floor(sel / 9), c = sel % 9;
      if (e.key === 'ArrowUp') sel = Math.max(0, r - 1) * 9 + c;
      if (e.key === 'ArrowDown') sel = Math.min(8, r + 1) * 9 + c;
      if (e.key === 'ArrowLeft') sel = r * 9 + Math.max(0, c - 1);
      if (e.key === 'ArrowRight') sel = r * 9 + Math.min(8, c + 1);
    }
    e.preventDefault(); render();
  }
});

$('#check').onclick = () => {
  wrong = new Set(board.map((v, i) => (v && v !== solution[i]) ? i : -1).filter(i => i >= 0));
  msgEl.textContent = wrong.size ? `틀린 칸 ${wrong.size}개` : '지금까지는 모두 맞아요!';
  render();
};
$('#hint').onclick = () => {
  if (done) return;
  let i = sel;
  if (i < 0 || fixed[i] || board[i] === solution[i]) {
    const empties = board.map((v, k) => v !== solution[k] ? k : -1).filter(k => k >= 0);
    if (!empties.length) return;
    i = empties[Math.floor(Math.random() * empties.length)];
  }
  sel = i; board[i] = solution[i]; fixed[i] = true; wrong.clear(); render();
};
$('#new').onclick = newGame;
$('#level').onchange = newGame;

newGame();

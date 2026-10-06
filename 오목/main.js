const N = 15, CELL = 40, PAD = 20;
const cv = document.getElementById('board'), ctx = cv.getContext('2d');
const statusEl = document.getElementById('status');
const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
const NAME = { 1: '흑', 2: '백' };

let board, turn, history, over, thinking;

function newGame() {
  board = Array.from({ length: N }, () => Array(N).fill(0));
  turn = 1; history = []; over = false; thinking = false;
  update(); draw();
}

const inB = (x, y) => x >= 0 && y >= 0 && x < N && y < N;

function countLine(x, y, p, dx, dy) {
  let c = 1;
  for (const s of [1, -1]) {
    let nx = x + dx * s, ny = y + dy * s;
    while (inB(nx, ny) && board[ny][nx] === p) { c++; nx += dx * s; ny += dy * s; }
  }
  return c;
}

function isWin(x, y) {
  const p = board[y][x];
  return DIRS.some(([dx, dy]) => countLine(x, y, p, dx, dy) >= 5);
}

function place(x, y) {
  board[y][x] = turn; history.push([x, y, turn]);
  if (isWin(x, y)) { over = true; statusEl.textContent = `🎉 ${NAME[turn]}돌 승리!`; draw(); return; }
  if (history.length === N * N) { over = true; statusEl.textContent = '무승부'; draw(); return; }
  turn = 3 - turn; update(); draw();
}

function update() {
  const ai = mode.value === 'ai';
  statusEl.textContent = ai && turn === 2 ? '컴퓨터 생각 중...' : `${NAME[turn]}돌 차례`;
  undo.disabled = !history.length;
}

/* ---------- AI ---------- */
function patternScore(c, open) {
  if (c >= 5) return 100000;
  if (!open) return 0;
  if (c === 4) return open === 2 ? 10000 : 1000;
  if (c === 3) return open === 2 ? 1000 : 100;
  if (c === 2) return open === 2 ? 100 : 10;
  return open === 2 ? 10 : 1;
}

function cellScore(x, y, p) {
  let total = 0;
  for (const [dx, dy] of DIRS) {
    let c = 1, open = 0;
    for (const s of [1, -1]) {
      let nx = x + dx * s, ny = y + dy * s;
      while (inB(nx, ny) && board[ny][nx] === p) { c++; nx += dx * s; ny += dy * s; }
      if (inB(nx, ny) && board[ny][nx] === 0) open++;
    }
    total += patternScore(c, open);
  }
  return total;
}

function aiMove() {
  if (!history.length) return place(7, 7);
  let best = -1, picks = [];
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    if (board[y][x]) continue;
    const s = cellScore(x, y, 2) * 1.05 + cellScore(x, y, 1) - (Math.abs(x - 7) + Math.abs(y - 7)) * 0.1;
    if (s > best + 1e-6) { best = s; picks = [[x, y]]; }
    else if (Math.abs(s - best) < 1e-6) picks.push([x, y]);
  }
  const [x, y] = picks[Math.floor(Math.random() * picks.length)];
  place(x, y);
}

/* ---------- 입력 ---------- */
cv.addEventListener('click', e => {
  if (over || thinking) return;
  const r = cv.getBoundingClientRect(), k = cv.width / r.width;
  const x = Math.round(((e.clientX - r.left) * k - PAD) / CELL);
  const y = Math.round(((e.clientY - r.top) * k - PAD) / CELL);
  if (!inB(x, y) || board[y][x]) return;
  place(x, y);
  if (!over && mode.value === 'ai') {
    thinking = true; update();
    setTimeout(() => { thinking = false; if (!over) aiMove(); }, 250);
  }
});

undo.onclick = () => {
  if (thinking || !history.length) return;
  const n = mode.value === 'ai' && history.length > 1 && !over || (mode.value === 'ai' && over && history[history.length - 1][2] === 2) ? 2 : 1;
  for (let i = 0; i < n && history.length; i++) { const [x, y, p] = history.pop(); board[y][x] = 0; turn = p; }
  over = false; update(); draw();
};
document.getElementById('new').onclick = newGame;
mode.onchange = newGame;

/* ---------- 그리기 ---------- */
function draw() {
  ctx.fillStyle = '#e0b66a'; ctx.fillRect(0, 0, cv.width, cv.height);
  ctx.strokeStyle = '#5a3d17'; ctx.lineWidth = 1;
  for (let i = 0; i < N; i++) {
    const p = PAD + i * CELL;
    ctx.beginPath(); ctx.moveTo(PAD, p); ctx.lineTo(PAD + (N - 1) * CELL, p); ctx.stroke();
    ctx.beginPath(); ctx.moveTo(p, PAD); ctx.lineTo(p, PAD + (N - 1) * CELL); ctx.stroke();
  }
  ctx.fillStyle = '#5a3d17';
  for (const a of [3, 7, 11]) for (const b of [3, 7, 11]) {
    ctx.beginPath(); ctx.arc(PAD + a * CELL, PAD + b * CELL, 4, 0, 7); ctx.fill();
  }
  for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
    const p = board[y][x]; if (!p) continue;
    const cx = PAD + x * CELL, cy = PAD + y * CELL;
    const g = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, 18);
    if (p === 1) { g.addColorStop(0, '#666'); g.addColorStop(1, '#000'); }
    else { g.addColorStop(0, '#fff'); g.addColorStop(1, '#bbb'); }
    ctx.fillStyle = g; ctx.beginPath(); ctx.arc(cx, cy, 17, 0, 7); ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,.4)'; ctx.stroke();
  }
  if (history.length) {
    const [x, y] = history[history.length - 1];
    ctx.fillStyle = '#e33'; ctx.beginPath(); ctx.arc(PAD + x * CELL, PAD + y * CELL, 4, 0, 7); ctx.fill();
  }
}

newGame();

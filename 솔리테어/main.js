const SUITS = ['♠','♥','♦','♣'];
const RANKS = ['','A','2','3','4','5','6','7','8','9','10','J','Q','K'];
const isRed = c => c.s === 1 || c.s === 2;
const $ = s => document.querySelector(s);

let G, hist = [], moves = 0, secs = 0, timer = null, autoTimer = null;

for (let i = 0; i < 7; i++) {
  const d = document.createElement('div');
  d.className = 'pile t'; d.dataset.pile = 't' + i;
  $('#tableau').appendChild(d);
}

function getPile(n) {
  if (n === 'stock') return G.stock;
  if (n === 'waste') return G.waste;
  return n[0] === 'f' ? G.f[+n[1]] : G.t[+n[1]];
}

function newGame() {
  clearInterval(autoTimer); clearInterval(timer);
  const deck = [];
  for (let s = 0; s < 4; s++) for (let r = 1; r <= 13; r++) deck.push({ s, r, up: false });
  for (let i = deck.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [deck[i], deck[j]] = [deck[j], deck[i]]; }
  G = { stock: [], waste: [], f: [[], [], [], []], t: [[], [], [], [], [], [], []] };
  for (let i = 0; i < 7; i++) for (let j = 0; j <= i; j++) { const c = deck.pop(); c.up = j === i; G.t[i].push(c); }
  G.stock = deck;
  hist = []; moves = 0; secs = 0;
  timer = setInterval(() => { secs++; updateStats(); }, 1000);
  $('#win').classList.remove('show');
  render();
}

function snapshot() { hist.push(JSON.stringify({ G, moves })); if (hist.length > 500) hist.shift(); }
function undo() {
  if (!hist.length) return;
  const o = JSON.parse(hist.pop()); G = o.G; moves = o.moves; render();
}

function updateStats() {
  $('#moves').textContent = moves;
  $('#time').textContent = Math.floor(secs / 60) + ':' + String(secs % 60).padStart(2, '0');
}

function cardEl(c, idx, top, left) {
  const d = document.createElement('div');
  d.className = 'card ' + (c.up ? (isRed(c) ? 'red' : 'black') : 'down');
  d.dataset.idx = idx;
  d.style.top = `calc(var(--w) * ${top})`;
  if (left) d.style.left = `calc(var(--w) * ${left})`;
  d.innerHTML = `<div class="tl">${RANKS[c.r]}<br>${SUITS[c.s]}</div><div class="mid">${SUITS[c.s]}</div>`;
  return d;
}

function render() {
  document.querySelectorAll('.pile').forEach(p => {
    p.querySelectorAll('.card').forEach(c => c.remove());
    const n = p.dataset.pile, arr = getPile(n);
    if (n === 'stock') { if (arr.length) p.appendChild(cardEl(arr[arr.length - 1], arr.length - 1, 0)); }
    else if (n === 'waste') {
      const k = +$('#draw').value, start = Math.max(0, arr.length - k);
      for (let i = start; i < arr.length; i++) p.appendChild(cardEl(arr[i], i, 0, (i - start) * 0.25));
    }
    else if (n[0] === 'f') { if (arr.length) p.appendChild(cardEl(arr[arr.length - 1], arr.length - 1, 0)); }
    else { let y = 0; arr.forEach((c, i) => { p.appendChild(cardEl(c, i, y)); y += c.up ? 0.34 : 0.14; }); }
  });
  updateStats();
  $('#undo').disabled = !hist.length;
  const allUp = G.t.every(col => col.every(c => c.up));
  $('#auto').disabled = !(allUp && !G.stock.length && !G.waste.length && G.f.some(f => f.length < 13));
  if (G.f.every(f => f.length === 13)) win();
}

function win() {
  clearInterval(timer); clearInterval(autoTimer);
  $('#winmsg').textContent = `${moves}번 이동, ${Math.floor(secs / 60)}분 ${secs % 60}초`;
  $('#win').classList.add('show');
}

function canPlace(cards, to) {
  const c = cards[0], dest = getPile(to);
  if (to[0] === 'f') {
    if (cards.length !== 1) return false;
    if (!dest.length) return c.r === 1;
    const t = dest[dest.length - 1]; return t.s === c.s && c.r === t.r + 1;
  }
  if (to[0] === 't') {
    if (!dest.length) return c.r === 13;
    const t = dest[dest.length - 1]; return t.up && isRed(t) !== isRed(c) && c.r === t.r - 1;
  }
  return false;
}

function doMove(from, idx, to) {
  const src = getPile(from), cards = src.slice(idx);
  if (!cards.length || from === to || !canPlace(cards, to)) return false;
  snapshot();
  src.splice(idx);
  if (from[0] === 't' && src.length) src[src.length - 1].up = true;
  getPile(to).push(...cards);
  moves++; render(); return true;
}

function autoMove(from, idx) {
  const src = getPile(from);
  if (idx === src.length - 1) for (let i = 0; i < 4; i++) if (doMove(from, idx, 'f' + i)) return true;
  for (let i = 0; i < 7; i++) {
    if (from === 't' + i) continue;
    if (idx === 0 && from[0] === 't' && src[0].r === 13) continue;
    if (doMove(from, idx, 't' + i)) return true;
  }
  return false;
}

function draw() {
  snapshot();
  if (!G.stock.length) {
    if (!G.waste.length) { hist.pop(); return; }
    G.stock = G.waste.reverse(); G.stock.forEach(c => c.up = false); G.waste = [];
  } else {
    const k = +$('#draw').value;
    for (let i = 0; i < k && G.stock.length; i++) { const c = G.stock.pop(); c.up = true; G.waste.push(c); }
  }
  moves++; render();
}

$('#stock').addEventListener('click', draw);
$('#undo').onclick = undo;
$('#new').onclick = newGame;
$('#draw').onchange = newGame;
$('#win button').onclick = newGame;
$('#auto').onclick = () => {
  autoTimer = setInterval(() => {
    for (const from of ['t0','t1','t2','t3','t4','t5','t6']) {
      const src = getPile(from);
      if (src.length) for (let i = 0; i < 4; i++) if (doMove(from, src.length - 1, 'f' + i)) return;
    }
    clearInterval(autoTimer);
  }, 90);
};

/* 드래그 & 클릭 */
let drag = null;
document.addEventListener('pointerdown', e => {
  const el = e.target.closest('.card');
  if (!el || el.closest('#ghost')) return;
  const pile = el.parentElement.dataset.pile;
  if (pile === 'stock') return;
  const idx = +el.dataset.idx, c = getPile(pile)[idx];
  if (!c || !c.up) return;
  if (pile === 'waste' && idx !== G.waste.length - 1) return;
  drag = { pile, idx, sx: e.clientX, sy: e.clientY, el, moved: false };
});

document.addEventListener('pointermove', e => {
  if (!drag) return;
  if (!drag.moved) {
    if (Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) < 5) return;
    drag.moved = true;
    const els = [...drag.el.parentElement.querySelectorAll('.card')].filter(x => +x.dataset.idx >= drag.idx);
    const r0 = els[0].getBoundingClientRect();
    drag.ox = drag.sx - r0.left; drag.oy = drag.sy - r0.top;
    const g = $('#ghost'); g.innerHTML = '';
    els.forEach(x => {
      const r = x.getBoundingClientRect(), cl = x.cloneNode(true);
      cl.style.left = (r.left - r0.left) + 'px'; cl.style.top = (r.top - r0.top) + 'px';
      g.appendChild(cl); x.classList.add('hide');
    });
    drag.els = els;
  }
  const g = $('#ghost');
  g.style.left = (e.clientX - drag.ox) + 'px'; g.style.top = (e.clientY - drag.oy) + 'px';
});

document.addEventListener('pointerup', e => {
  if (!drag) return;
  const d = drag; drag = null;
  if (!d.moved) { autoMove(d.pile, d.idx); return; }
  const g = $('#ghost');
  const prev = g.style.display; g.style.display = 'none';
  const target = document.elementFromPoint(e.clientX, e.clientY)?.closest('.pile');
  g.style.display = prev; g.innerHTML = '';
  if (!(target && doMove(d.pile, d.idx, target.dataset.pile))) render();
});

document.addEventListener('pointercancel', () => { if (drag) { drag = null; $('#ghost').innerHTML = ''; render(); } });

newGame();

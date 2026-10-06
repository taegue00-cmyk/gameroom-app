const games = [
  { name: '스네이크 게임', icon: '🐍', desc: '먹이를 먹고 길어져라', path: 'Snake game/index.html', color: '#39ff14' },
  { name: '솔리테어', icon: '🃏', desc: '카드를 모두 정리하자', path: '솔리테어/index.html', color: '#ff2e63' },
  { name: '스도쿠', icon: '🔢', desc: '숫자 퍼즐 도전', path: '스도쿠/index.html', color: '#00e5ff' },
  { name: '오목', icon: '⚫', desc: '다섯 알을 먼저 이어라', path: '오목/index.html', color: '#ffd400' },
  { name: '피카츄 배구', icon: '⚡', desc: '1인용 / 2인용 배구', path: '피카츄 배구/index.html', color: '#ff9a00' },
];

const list = document.getElementById('cards');

games.forEach((g, i) => {
  const li = document.createElement('li');
  const a = document.createElement('a');
  a.className = 'card';
  a.href = encodeURI(g.path);
  a.style.setProperty('--accent', g.color);
  a.innerHTML =
    `<span class="no">P${i + 1}</span>` +
    `<span class="icon">${g.icon}</span>` +
    `<strong class="name">${g.name}</strong>` +
    `<span class="desc">${g.desc}</span>` +
    `<span class="play">PRESS START</span>`;
  li.appendChild(a);
  list.appendChild(li);
});

// 키보드 선택: 방향키로 이동, Enter는 링크 기본 동작
const cards = [...document.querySelectorAll('.card')];
cards[0].focus();

document.addEventListener('keydown', (e) => {
  const cur = cards.indexOf(document.activeElement);
  const step = { ArrowRight: 1, ArrowDown: 1, ArrowLeft: -1, ArrowUp: -1 }[e.key];
  if (!step) return;
  e.preventDefault();
  const next = (cur + step + cards.length) % cards.length;
  cards[next].focus();
});

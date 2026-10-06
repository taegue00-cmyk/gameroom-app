# 🎮 Gameroom App

브라우저에서 바로 즐기는 미니 게임 모음입니다. 별도 설치나 빌드 없이 HTML, CSS, JavaScript만으로 만들었습니다.

## 게임 목록

| 게임 | 폴더 | 설명 |
| --- | --- | --- |
| 🐍 스네이크 게임 | [Snake game](Snake%20game/) | 먹이를 먹으며 길어지는 뱀 게임. 일시정지 지원 |
| 🃏 솔리테어 | [솔리테어](솔리테어/) | 카드 solitaire. 되돌리기, 자동 완성, 새 게임 지원 |
| 🔢 스도쿠 | [스도쿠](스도쿠/) | 숫자 퍼즐. 검사, 힌트, 새 게임 지원 |
| ⚫⚪ 오목 | [오목](오목/) | 오목 보드 게임. 무르기, 새 게임 지원 |
| ⚡ 피카츄 배구 | [피카츄 배구](피카츄%20배구/) | 1인용(vs 컴퓨터) / 2인용 배구 게임 |

## 실행 방법

1. 저장소를 내려받습니다.
   ```bash
   git clone https://github.com/taegue00-cmyk/gameroom-app.git
   ```
2. 루트의 `index.html`을 브라우저(Chrome, Edge 등)에서 열고, 카드를 눌러 게임을 선택합니다. 각 게임 폴더의 `index.html`을 직접 열어도 됩니다.

## 프로젝트 구조

```
gameroom-app/
├── index.html       # 메인 페이지 (오락기 디자인)
├── main.js
├── style.css
├── Snake game/      # index.html, main.js, style.css
├── 솔리테어/         # index.html, main.js, style.css
├── 스도쿠/           # index.html, main.js, style.css
├── 오목/             # index.html, main.js, style.css
└── 피카츄 배구/       # index.html, main.js, style.css
```

## 기술 스택

- HTML5 / CSS3
- Vanilla JavaScript (프레임워크 없음)

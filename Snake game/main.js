const GRID_SIZE = 20;
const CELL_SIZE = 400 / GRID_SIZE;
const HIGH_SCORE_KEY = "snakeHighScore";
const POINTS_PER_FOOD = 10;
const POINTS_PER_LEVEL = 50;
const SPEED_INCREASE_PER_LEVEL = 10;
const MIN_INTERVAL = 30;

const canvas = document.getElementById("game-canvas");
const ctx = canvas.getContext("2d");
const scoreEl = document.getElementById("score");
const highScoreEl = document.getElementById("high-score");
const levelEl = document.getElementById("level");
const overlay = document.getElementById("overlay");
const overlayMessage = document.getElementById("overlay-message");
const startBtn = document.getElementById("start-btn");
const pauseBtn = document.getElementById("pause-btn");
const difficultySelect = document.getElementById("difficulty");

let snake = [];
let direction = { x: 1, y: 0 };
let nextDirection = { x: 1, y: 0 };
let food = { x: 0, y: 0 };
let score = 0;
let level = 1;
let baseInterval = Number(difficultySelect.value);
let currentInterval = baseInterval;
let highScore = Number(localStorage.getItem(HIGH_SCORE_KEY)) || 0;
let running = false;
let paused = false;
let loopId = null;

highScoreEl.textContent = highScore;
pauseBtn.disabled = true;

function resetGame() {
  snake = [
    { x: 8, y: 10 },
    { x: 7, y: 10 },
    { x: 6, y: 10 },
  ];
  direction = { x: 1, y: 0 };
  nextDirection = { x: 1, y: 0 };
  score = 0;
  level = 1;
  baseInterval = Number(difficultySelect.value);
  currentInterval = baseInterval;
  scoreEl.textContent = score;
  levelEl.textContent = level;
  placeFood();
}

function placeFood() {
  let position;
  do {
    position = {
      x: Math.floor(Math.random() * GRID_SIZE),
      y: Math.floor(Math.random() * GRID_SIZE),
    };
  } while (snake.some((seg) => seg.x === position.x && seg.y === position.y));
  food = position;
}

function drawCell(x, y, color) {
  ctx.fillStyle = color;
  ctx.fillRect(x * CELL_SIZE, y * CELL_SIZE, CELL_SIZE - 1, CELL_SIZE - 1);
}

function draw() {
  ctx.fillStyle = "#12121c";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  drawCell(food.x, food.y, "#ff6b6b");

  snake.forEach((seg, i) => {
    drawCell(seg.x, seg.y, i === 0 ? "#7cf29c" : "#4bb96f");
  });
}

function updateLevel() {
  const newLevel = Math.floor(score / POINTS_PER_LEVEL) + 1;
  if (newLevel > level) {
    level = newLevel;
    levelEl.textContent = level;
    currentInterval = Math.max(
      MIN_INTERVAL,
      baseInterval - (level - 1) * SPEED_INCREASE_PER_LEVEL
    );
  }
}

function update() {
  direction = nextDirection;
  const head = {
    x: snake[0].x + direction.x,
    y: snake[0].y + direction.y,
  };

  if (
    head.x < 0 ||
    head.x >= GRID_SIZE ||
    head.y < 0 ||
    head.y >= GRID_SIZE ||
    snake.some((seg) => seg.x === head.x && seg.y === head.y)
  ) {
    gameOver();
    return;
  }

  snake.unshift(head);

  if (head.x === food.x && head.y === food.y) {
    score += POINTS_PER_FOOD;
    scoreEl.textContent = score;
    updateLevel();
    placeFood();
  } else {
    snake.pop();
  }

  draw();
}

function gameLoop() {
  update();
  if (running && !paused) {
    loopId = setTimeout(gameLoop, currentInterval);
  }
}

function gameOver() {
  running = false;
  paused = false;
  clearTimeout(loopId);
  pauseBtn.disabled = true;
  pauseBtn.textContent = "일시정지";

  if (score > highScore) {
    highScore = score;
    localStorage.setItem(HIGH_SCORE_KEY, highScore);
    highScoreEl.textContent = highScore;
  }

  overlayMessage.textContent = `게임 오버! 점수: ${score}`;
  startBtn.textContent = "다시 시작";
  overlay.classList.remove("hidden");
}

function startGame() {
  resetGame();
  draw();
  running = true;
  paused = false;
  pauseBtn.disabled = false;
  pauseBtn.textContent = "일시정지";
  overlay.classList.add("hidden");
  clearTimeout(loopId);
  loopId = setTimeout(gameLoop, currentInterval);
}

function togglePause() {
  if (!running) return;
  paused = !paused;
  if (paused) {
    clearTimeout(loopId);
    pauseBtn.textContent = "재개";
  } else {
    pauseBtn.textContent = "일시정지";
    loopId = setTimeout(gameLoop, currentInterval);
  }
}

startBtn.addEventListener("click", startGame);
pauseBtn.addEventListener("click", togglePause);

document.addEventListener("keydown", (e) => {
  if (!running || paused) return;

  switch (e.key) {
    case "ArrowUp":
      if (direction.y === 0) nextDirection = { x: 0, y: -1 };
      break;
    case "ArrowDown":
      if (direction.y === 0) nextDirection = { x: 0, y: 1 };
      break;
    case "ArrowLeft":
      if (direction.x === 0) nextDirection = { x: -1, y: 0 };
      break;
    case "ArrowRight":
      if (direction.x === 0) nextDirection = { x: 1, y: 0 };
      break;
    default:
      return;
  }
  e.preventDefault();
});

resetGame();
draw();

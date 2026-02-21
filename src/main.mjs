import { createInitialState, queueDirection, tick, togglePause } from './snakeLogic.mjs';

const GRID_SIZE = 20;
const TICK_MS = 140;
const OBSTACLE_RATIO = 0.08;
const RESET_COUNTDOWN_SECONDS = 3;

const elements = {
  board: document.getElementById('board'),
  score: document.getElementById('score-value'),
  status: document.getElementById('status'),
  startOverlay: document.getElementById('start-overlay'),
  gameOverOverlay: document.getElementById('game-over-overlay'),
  gameOverCountdown: document.getElementById('game-over-countdown'),
  restartButton: document.getElementById('restart'),
  pauseButton: document.getElementById('pause'),
  controls: document.querySelectorAll('[data-dir]'),
  obstacleModeButtons: document.querySelectorAll('[data-obstacles-mode]'),
};

let obstaclesEnabled = false;
let state = createInitialState({ width: GRID_SIZE, height: GRID_SIZE, obstacleCount: 0 });
let started = false;
let resetCountdown = null;
let resetCountdownTimer = null;

function createGameState() {
  return createInitialState({
    width: GRID_SIZE,
    height: GRID_SIZE,
    obstacleCount: obstaclesEnabled ? Math.floor((GRID_SIZE * GRID_SIZE) * OBSTACLE_RATIO) : 0,
  });
}

function updateModeButtons() {
  for (const button of elements.obstacleModeButtons) {
    const active = button.dataset.obstaclesMode === (obstaclesEnabled ? 'obstacles' : 'open');
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
  }
}

function restart() {
  stopResetCountdown();
  state = createGameState();
  started = false;
  render();
}

function stopResetCountdown() {
  if (resetCountdownTimer !== null) {
    clearInterval(resetCountdownTimer);
    resetCountdownTimer = null;
  }
  resetCountdown = null;
}

function startResetCountdown() {
  if (resetCountdownTimer !== null) {
    return;
  }

  resetCountdown = RESET_COUNTDOWN_SECONDS;
  resetCountdownTimer = setInterval(() => {
    if (resetCountdown === null) {
      return;
    }

    resetCountdown -= 1;
    if (resetCountdown <= 0) {
      restart();
      return;
    }

    render();
  }, 1000);
}

function setDirection(direction) {
  state = queueDirection(state, direction);
}

function update() {
  if (!started) {
    return;
  }
  const wasGameOver = state.gameOver;
  state = tick(state);
  if (!wasGameOver && state.gameOver) {
    startResetCountdown();
  }
  render();
}

function handleKeyDown(event) {
  const map = {
    ArrowUp: 'up',
    KeyW: 'up',
    ArrowDown: 'down',
    KeyS: 'down',
    ArrowLeft: 'left',
    KeyA: 'left',
    ArrowRight: 'right',
    KeyD: 'right',
  };

  if (event.code === 'Space') {
    if (!started) {
      return;
    }
    event.preventDefault();
    state = togglePause(state);
    render();
    return;
  }

  if (!started) {
    if (event.code === 'ArrowLeft') {
      event.preventDefault();
      obstaclesEnabled = false;
      state = createGameState();
      started = true;
      render();
      return;
    }
    if (event.code === 'ArrowRight') {
      event.preventDefault();
      obstaclesEnabled = true;
      state = createGameState();
      started = true;
      render();
      return;
    }
    if (event.code === 'ArrowUp' || event.code === 'ArrowDown') {
      const direction = map[event.code];
      event.preventDefault();
      started = true;
      setDirection(direction);
      render();
      return;
    }
    return;
  }

  const direction = map[event.code];
  if (!direction) {
    return;
  }

  event.preventDefault();
  setDirection(direction);
}

function render() {
  const totalCells = state.width * state.height;
  const cellClass = new Array(totalCells).fill('cell');

  for (const obstacle of state.obstacles) {
    const index = obstacle.y * state.width + obstacle.x;
    cellClass[index] = 'cell obstacle';
  }

  for (const segment of state.snake) {
    const index = segment.y * state.width + segment.x;
    cellClass[index] = 'cell snake';
  }

  const head = state.snake[0];
  cellClass[head.y * state.width + head.x] = 'cell snake head';

  if (state.food) {
    const foodIndex = state.food.y * state.width + state.food.x;
    cellClass[foodIndex] = 'cell food';
  }

  elements.board.innerHTML = cellClass.map((name) => `<div class="${name}"></div>`).join('');
  elements.score.textContent = String(state.score);

  if (state.gameOver) {
    elements.status.textContent = 'Start over';
  } else if (!started) {
    elements.status.textContent = 'Choose your path';
  } else if (state.paused) {
    elements.status.textContent = 'Paused';
  } else {
    elements.status.textContent = 'Running';
  }

  elements.pauseButton.textContent = state.paused ? 'Resume' : 'Pause';
  elements.startOverlay.classList.toggle('hidden', started);
  const showGameOverOverlay = state.gameOver && resetCountdown !== null;
  elements.gameOverOverlay.classList.toggle('hidden', !showGameOverOverlay);
  if (showGameOverOverlay) {
    elements.gameOverCountdown.textContent = String(resetCountdown);
  }
  updateModeButtons();
}

setInterval(update, TICK_MS);

document.addEventListener('keydown', handleKeyDown);
elements.restartButton.addEventListener('click', restart);
elements.pauseButton.addEventListener('click', () => {
  if (!started) {
    return;
  }
  state = togglePause(state);
  render();
});

for (const control of elements.controls) {
  control.addEventListener('click', () => {
    setDirection(control.dataset.dir);
  });
}

for (const button of elements.obstacleModeButtons) {
  button.addEventListener('click', () => {
    if (started) {
      return;
    }
    obstaclesEnabled = button.dataset.obstaclesMode === 'obstacles';
    state = createGameState();
    render();
  });
}

render();

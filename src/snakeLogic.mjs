export const DIRECTIONS = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITES = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

export function createInitialState({
  width = 20,
  height = 20,
  rng = Math.random,
  obstacleCount = Math.floor((width * height) * 0.08),
} = {}) {
  const centerY = Math.floor(height / 2);

  const snake = [
    { x: 0, y: centerY },
    { x: width - 1, y: centerY },
    { x: width - 2, y: centerY },
  ];

  const baseState = {
    width,
    height,
    snake,
    direction: 'right',
    nextDirection: null,
    obstacles: [],
    food: null,
    score: 0,
    gameOver: false,
    paused: false,
  };

  const obstacles = placeObstacles(baseState, obstacleCount, rng);
  const withObstacles = {
    ...baseState,
    obstacles,
  };

  return {
    ...withObstacles,
    food: placeFood(withObstacles, rng),
  };
}

export function queueDirection(state, direction) {
  if (!(direction in DIRECTIONS)) {
    return state;
  }

  const currentDirection = state.nextDirection ?? state.direction;
  if (OPPOSITES[currentDirection] === direction) {
    return state;
  }

  return {
    ...state,
    nextDirection: direction,
  };
}

export function togglePause(state) {
  if (state.gameOver) {
    return state;
  }

  return {
    ...state,
    paused: !state.paused,
  };
}

export function tick(state, rng = Math.random) {
  if (state.gameOver || state.paused) {
    return state;
  }

  const direction = state.nextDirection ?? state.direction;
  const movement = DIRECTIONS[direction];
  const head = state.snake[0];
  const nextHead = {
    x: (head.x + movement.x + state.width) % state.width,
    y: (head.y + movement.y + state.height) % state.height,
  };
  const obstacles = state.obstacles ?? [];

  if (isSnakeCollision(nextHead, obstacles)) {
    return {
      ...state,
      direction,
      nextDirection: null,
      gameOver: true,
    };
  }

  const willGrow = state.food && nextHead.x === state.food.x && nextHead.y === state.food.y;
  const bodyToCheck = willGrow ? state.snake : state.snake.slice(0, -1);
  if (isSnakeCollision(nextHead, bodyToCheck)) {
    return {
      ...state,
      direction,
      nextDirection: null,
      gameOver: true,
    };
  }

  const snake = [nextHead, ...state.snake];
  if (!willGrow) {
    snake.pop();
  }

  let food = state.food;
  let score = state.score;
  let gameOver = state.gameOver;

  if (willGrow) {
    score += 1;
    food = placeFood({ ...state, snake }, rng);
    if (!food) {
      gameOver = true;
    }
  }

  return {
    ...state,
    snake,
    direction,
    nextDirection: null,
    food,
    score,
    gameOver,
  };
}

export function placeFood(state, rng = Math.random) {
  const occupied = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
  const obstacles = state.obstacles ?? [];
  for (const obstacle of obstacles) {
    occupied.add(`${obstacle.x},${obstacle.y}`);
  }
  const freeCells = [];

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) {
    return null;
  }

  const index = Math.floor(rng() * freeCells.length);
  return freeCells[index];
}

export function placeObstacles(state, count, rng = Math.random) {
  const occupied = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
  const freeCells = [];

  for (let y = 0; y < state.height; y += 1) {
    for (let x = 0; x < state.width; x += 1) {
      const key = `${x},${y}`;
      if (!occupied.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  const maxCount = Math.min(count, freeCells.length);
  const obstacles = [];
  for (let i = 0; i < maxCount; i += 1) {
    const index = Math.floor(rng() * freeCells.length);
    obstacles.push(freeCells[index]);
    freeCells.splice(index, 1);
  }

  return obstacles;
}

export function isWallCollision(point, width, height) {
  return point.x < 0 || point.y < 0 || point.x >= width || point.y >= height;
}

export function isSnakeCollision(point, snake) {
  return snake.some((segment) => segment.x === point.x && segment.y === point.y);
}

import assert from 'node:assert/strict';
import { createInitialState, queueDirection, tick, placeFood } from '../src/snakeLogic.mjs';

const tests = [];

function test(name, fn) {
  tests.push({ name, fn });
}

test('moves snake one cell in current direction', () => {
  const state = createInitialState({ width: 8, height: 8, rng: () => 0 });
  const next = tick(state, () => 0);

  assert.deepEqual(next.snake[0], { x: state.snake[0].x + 1, y: state.snake[0].y });
  assert.equal(next.score, 0);
  assert.equal(next.gameOver, false);
});

test('starts snake on the left edge', () => {
  const state = createInitialState({ width: 8, height: 8, rng: () => 0, obstacleCount: 0 });

  assert.deepEqual(state.snake[0], { x: 0, y: 4 });
  assert.deepEqual(state.snake[1], { x: 7, y: 4 });
  assert.deepEqual(state.snake[2], { x: 6, y: 4 });
});

test('grows and increments score after eating food', () => {
  const state = createInitialState({ width: 8, height: 8, rng: () => 0 });
  const foodAhead = { ...state, food: { x: state.snake[0].x + 1, y: state.snake[0].y } };
  const next = tick(foodAhead, () => 0);

  assert.equal(next.snake.length, state.snake.length + 1);
  assert.equal(next.score, 1);
  assert.notDeepEqual(next.food, foodAhead.food);
});

test('wraps around horizontal edges', () => {
  const state = {
    ...createInitialState({ width: 5, height: 5, rng: () => 0 }),
    snake: [{ x: 4, y: 2 }, { x: 3, y: 2 }, { x: 2, y: 2 }],
    direction: 'right',
    nextDirection: null,
  };

  const next = tick(state, () => 0);
  assert.equal(next.gameOver, false);
  assert.deepEqual(next.snake[0], { x: 0, y: 2 });
});

test('ends game on self collision', () => {
  const state = {
    ...createInitialState({ width: 7, height: 7, rng: () => 0 }),
    snake: [
      { x: 3, y: 3 },
      { x: 3, y: 4 },
      { x: 2, y: 4 },
      { x: 2, y: 3 },
      { x: 2, y: 2 },
      { x: 3, y: 2 },
    ],
    direction: 'up',
    nextDirection: 'left',
  };

  const next = tick(state, () => 0);
  assert.equal(next.gameOver, true);
});

test('ends game on obstacle collision', () => {
  const state = {
    ...createInitialState({ width: 7, height: 7, rng: () => 0, obstacleCount: 0 }),
    snake: [
      { x: 3, y: 3 },
      { x: 2, y: 3 },
      { x: 1, y: 3 },
    ],
    obstacles: [{ x: 4, y: 3 }],
    direction: 'right',
    nextDirection: null,
  };

  const next = tick(state, () => 0);
  assert.equal(next.gameOver, true);
});

test('prevents direct reverse direction', () => {
  const state = createInitialState({ width: 8, height: 8, rng: () => 0 });
  const changed = queueDirection(state, 'left');

  assert.equal(changed.nextDirection, null);
});

test('food placement never overlaps snake', () => {
  const state = {
    width: 3,
    height: 3,
    snake: [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  };

  const food = placeFood(state, () => 0);
  assert.deepEqual(food, { x: 2, y: 2 });
});

test('food placement never overlaps obstacles', () => {
  const state = {
    width: 3,
    height: 3,
    snake: [{ x: 0, y: 0 }],
    obstacles: [
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 0, y: 1 },
      { x: 1, y: 1 },
      { x: 2, y: 1 },
      { x: 0, y: 2 },
      { x: 1, y: 2 },
    ],
  };

  const food = placeFood(state, () => 0);
  assert.deepEqual(food, { x: 2, y: 2 });
});

let failed = false;
for (const { name, fn } of tests) {
  try {
    fn();
    console.log(`PASS ${name}`);
  } catch (error) {
    failed = true;
    console.error(`FAIL ${name}`);
    console.error(error.stack || error.message);
  }
}

if (failed) {
  process.exitCode = 1;
} else {
  console.log(`All ${tests.length} tests passed.`);
}

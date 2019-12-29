const fs = require('fs');

const FILE_NAME = './13/input';

const MODES = {
  POSITION: 0,
  IMMEDIATE: 1,
  RELATIVE: 2
};

const TILE_TYPES = {
  EMPTY: 0,
  WALL: 1,
  BLOCK: 2,
  HORIZONTAL_PADDLE: 3,
  BALL: 4
};

const PADDLE_POSITIONS = {
  LEFT: -1,
  NEUTRAL: 0,
  RIGHT: 1
};

const state = {
  input: 0,
  output: [],
  program: [],
  cursor: 0,
  programRunning: true,
  relativeBase: 0,
  grid: {},
  score: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  state.program = input.split(',').map(x => parseInt(x, 10));
};

const parseInstruction = instruction => {
  const [mode3, mode2, mode1, opcode1, opcode2] = `00000${instruction}`.substr(-5);
  return [
    parseInt(`${opcode1}${opcode2}`, 10),
    parseInt(mode1, 10),
    parseInt(mode2, 10),
    parseInt(mode3, 10),
  ]
};

const getParameter = (mode, address) => {
  if (mode === MODES.POSITION) {
    return state.program[address];
  }
  if (mode === MODES.IMMEDIATE) {
    return address;
  }
  if (mode === MODES.RELATIVE) {
    return state.program[state.relativeBase + address];
  }
};

const setParameter = (mode, address, value) => {
  const addressToWrite = mode === MODES.RELATIVE ? state.relativeBase + address : address;
  state.program[addressToWrite] = value;
};

const parseOutput = () => {
  if (state.output.length === 3) {
    const [x, y, n] = state.output;

    if (x === -1 && y === 0) {
      state.score = n;
    } else {
      state.grid[`${x},${y}`] = n;
    }

    state.output = [];
  }
};

const findTile = tileId => {
  const index = Object.values(state.grid).findIndex(n => n === tileId);
  const key = Object.keys(state.grid)[index];
  const [x, y] = key.split(',').map(n => parseInt(n, 10));
  return { x, y };
}

const setInput = () => {
  const paddle = findTile(TILE_TYPES.HORIZONTAL_PADDLE);
  const ball = findTile(TILE_TYPES.BALL);

  if (ball.x < paddle.x) {
    state.input = PADDLE_POSITIONS.LEFT;
    return;
  }

  if (ball.x > paddle.x) {
    state.input = PADDLE_POSITIONS.RIGHT;
    return;
  }

  state.input = PADDLE_POSITIONS.NEUTRAL;
};

const runProgram = () => {
  state.programRunning = true;
  state.cursor = 0;

  while (state.programRunning) {
    const instruction = state.program[state.cursor];
    const [opcode, mode1, mode2, mode3] = parseInstruction(instruction);

    if (opcode === 99) {
      state.programRunning = false;
      continue;
    }

    if (opcode === 1) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      const value = getParameter(mode1, i) + getParameter(mode2, j);
      setParameter(mode3, output, value);
      state.cursor += 4;
    }

    if (opcode === 2) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      const value = getParameter(mode1, i) * getParameter(mode2, j);
      setParameter(mode3, output, value);
      state.cursor += 4;
    }

    if (opcode === 3) {
      const output = state.program[state.cursor + 1];
      setInput();
      setParameter(mode1, output, state.input);
      state.cursor += 2;
    }

    if (opcode === 4) {
      const output = state.program[state.cursor + 1];
      state.output.push(getParameter(mode1, output));
      parseOutput();
      state.cursor += 2;
    }

    if (opcode === 5) {
      const [i, j] = state.program.slice(state.cursor + 1, state.cursor + 3);
      if (getParameter(mode1, i) !== 0) {
        state.cursor = getParameter(mode2, j);
      } else {
        state.cursor += 3;
      }
    }

    if (opcode === 6) {
      const [i, j] = state.program.slice(state.cursor + 1, state.cursor + 3);
      if (getParameter(mode1, i) === 0) {
        state.cursor = getParameter(mode2, j);
      } else {
        state.cursor += 3;
      }
    }

    if (opcode === 7) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      const value = getParameter(mode1, i) < getParameter(mode2, j) ? 1 : 0;
      setParameter(mode3, output, value);
      state.cursor += 4;
    }

    if (opcode === 8) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      const value = getParameter(mode1, i) === getParameter(mode2, j) ? 1 : 0;
      setParameter(mode3, output, value);
      state.cursor += 4;
    }

    if (opcode === 9) {
      const output = state.program[state.cursor + 1];
      state.relativeBase += getParameter(mode1, output);
      state.cursor += 2;
    }
  }
};

const run = () => {
  parseInput();
  state.program[0] = 2;
  runProgram();
};

run();
console.log(`The final score is ${state.score}`);

const fs = require('fs');

const FILE_NAME = './11/input';

const MODES = {
  POSITION: 0,
  IMMEDIATE: 1,
  RELATIVE: 2
};

const PAINT_COLORS = {
  BLACK: 0,
  WHITE: 1
};

const DIRECTIONS = {
  LEFT: 0,
  RIGHT: 1
};

const ORIENTATIONS = {
  UP: 0,
  RIGHT: 1,
  DOWN: 2,
  LEFT: 3
};

const ROBOT_INSTRUCTIONS = {
  PAINT: 0,
  MOVE: 1
};

const state = {
  input: PAINT_COLORS.WHITE,
  output: [],
  program: [],
  cursor: 0,
  programRunning: true,
  relativeBase: 0,
  robot: {
    positionX: 0,
    positionY: 0,
    facing: ORIENTATIONS.UP,
    nextInstruction: ROBOT_INSTRUCTIONS.PAINT
  },
  grid: {}
};

const toCoordinates = key => key.split(',').map(n => parseInt(n, 10));

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
  const output = state.output.shift();

  if (state.robot.nextInstruction === ROBOT_INSTRUCTIONS.PAINT) {
    const currentCoordinate = `${state.robot.positionX},${state.robot.positionY}`;
    state.grid[currentCoordinate] = output;

    state.robot.nextInstruction = ROBOT_INSTRUCTIONS.MOVE;
    return;
  }

  if (state.robot.nextInstruction === ROBOT_INSTRUCTIONS.MOVE) {
    const rotation = output === DIRECTIONS.LEFT ? 3 : 1;
    state.robot.facing = (state.robot.facing + rotation) % 4;

    switch (state.robot.facing) {
      case ORIENTATIONS.UP:
        state.robot.positionY += 1;
        break;
      case ORIENTATIONS.RIGHT:
        state.robot.positionX += 1;
        break;
      case ORIENTATIONS.DOWN:
        state.robot.positionY -= 1;
        break;
      case ORIENTATIONS.LEFT:
        state.robot.positionX -= 1;
        break;
      default:
        break;
    }

    const newCoordinate = `${state.robot.positionX},${state.robot.positionY}`;
    const newPanelColor = state.grid[newCoordinate] || PAINT_COLORS.BLACK;
    state.input = newPanelColor;

    state.robot.nextInstruction = ROBOT_INSTRUCTIONS.PAINT;
    return;
  }
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

const paint = () => {
  const whitePanels = Object.keys(state.grid)
    .filter(key => state.grid[key] === PAINT_COLORS.WHITE)
    .map(key => {
      const [x, y] = toCoordinates(key);
      return { x, y };
    });

  const xCoordinates = whitePanels.map(({ x }) => x);
  const yCoordinates = whitePanels.map(({ y }) => y);

  const minX = Math.min(...xCoordinates);
  const minY = Math.min(...yCoordinates);
  const maxX = Math.max(...xCoordinates);
  const maxY = Math.max(...yCoordinates);

  for (let y = maxY; y >= minY; y--) {
    const line = [];
    for (let x = minX; x <= maxX; x++) {
      const isWhitePanel = whitePanels.find(panel => panel.x === x && panel.y === y);
      line.push(isWhitePanel ? '#' : '.');
    }
    console.log(line.join(''));
  }
};

const run = () => {
  parseInput();
  runProgram();
  paint();
};

run();

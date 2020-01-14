const fs = require('fs');

const FILE_NAME = 'input';
const FIND_PATH = false;
const VIDEO_FEED_ENABLED = true;

const MODES = {
  POSITION: 0,
  IMMEDIATE: 1,
  RELATIVE: 2
};

const TILE_TYPES = {
  SCAFFOLD: '#',
  SPACE: '.'
};

const MOVEMENTS = {
  LEFT: 'L',
  RIGHT: 'R'
};

const ROBOT_DIRECTIONS = {
  UP: '^',
  RIGHT: '>',
  DOWN: 'v',
  LEFT: '<'
};

const DIRECTION_LIST = Object.values(ROBOT_DIRECTIONS);

const state = {
  findPath: FIND_PATH,
  input: [],
  inputCursor: 0,
  output: [],
  program: [],
  cursor: 0,
  programRunning: true,
  relativeBase: 0,
  grid: {},
  robot: {},
  path: []
};

const parseInput = () => {
  const input = fs.readFileSync(`${__dirname}/${FILE_NAME}`, 'utf8');
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
      const input = state.input[state.inputCursor++];
      setParameter(mode1, output, input);
      state.cursor += 2;
    }

    if (opcode === 4) {
      const output = state.program[state.cursor + 1];
      state.output.push(getParameter(mode1, output));
      state.cursor += 2;

      if (state.output[state.output.length - 1] === 10 && state.output[state.output.length - 2] === 10) {
        state.output = [];
      }
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

const drawGrid = () => {
  const knownCoords = Object.keys(state.grid).map(key => {
    const [x, y] = toCoordinates(key);
    return { x, y };
  });

  const xCoordinates = knownCoords.map(({ x }) => x);
  const yCoordinates = knownCoords.map(({ y }) => y);

  const minX = Math.min(...xCoordinates);
  const minY = Math.min(...yCoordinates);
  const maxX = Math.max(...xCoordinates);
  const maxY = Math.max(...yCoordinates);

  for (let y = minY; y <= maxY; y++) {
    const line = [];
    for (let x = minX; x <= maxX; x++) {
      line.push(state.grid[toKey(x, y)]);
    }
    console.log(line.join(''));
  }
};

const toKey = (x, y) => `${x},${y}`;
const toCoordinates = key => key.split(',').map(n => parseInt(n, 10));

const buildGrid = () => {
  const lines = state.output
    .map(x => String.fromCharCode(x))
    .join('')
    .replace(/\s+$/g, '')
    .split('\n');

  state.gridHeight = lines.length;

  lines.forEach((line, y) => {
    state.gridWidth = line.length;
    line.split('').forEach((tile, x) => {
      state.grid[toKey(x, y)] = tile;
    });
  });
};

const getNextCoord = (x, y, facing) => {
  if (facing === ROBOT_DIRECTIONS.UP) return { x, y: y - 1 };
  if (facing === ROBOT_DIRECTIONS.RIGHT) return { x: x + 1, y };
  if (facing === ROBOT_DIRECTIONS.DOWN) return { x, y: y + 1 };
  if (facing === ROBOT_DIRECTIONS.LEFT) return { x: x - 1, y };
};

const getNextTile = (x, y, facing) => {
  const { x: newX, y: newY } = getNextCoord(x, y, facing);
  return state.grid[toKey(newX, newY)];
};

const getRotation = () => {
  const { x, y, facing } = state.robot;
  const facingIndex = DIRECTION_LIST.indexOf(facing);
  const leftFacing = DIRECTION_LIST[(facingIndex + 3) % 4];
  const rightFacing = DIRECTION_LIST[(facingIndex + 1) % 4];
  const leftTile = getNextTile(x, y, leftFacing);
  const rightTile = getNextTile(x, y, rightFacing);


  if (leftTile === TILE_TYPES.SCAFFOLD) {
    return { rotation: MOVEMENTS.LEFT, facing: leftFacing };
  }
  if (rightTile === TILE_TYPES.SCAFFOLD) {
    return { rotation: MOVEMENTS.RIGHT, facing: rightFacing };
  }
};

const moveRobot = () => {
  const { x, y, facing } = state.robot;
  const { x: newX, y: newY } = getNextCoord(x, y, facing);
  state.robot.x = newX;
  state.robot.y = newY;
};

const calculatePath = () => {
  const robotCoords = Object.keys(state.grid)
    .find(tile => Object.values(ROBOT_DIRECTIONS).includes(state.grid[tile]));

  const [x, y] = toCoordinates(robotCoords);
  const facing = state.grid[robotCoords];
  state.robot = { x, y, facing };

  let finishedPath = false;
  let movementCount = 0;

  while (!finishedPath) {
    const { x, y, facing } = state.robot;
    const next = getNextTile(x, y, facing);

    if (!next || next === TILE_TYPES.SPACE) {
      if (movementCount > 0) {
        state.path.push(movementCount);
      }
      movementCount = 0;

      const rotation = getRotation();

      if (!rotation) {
        finishedPath = true;
      } else {
        state.path.push(rotation.rotation);
        state.robot.facing = rotation.facing;
      }
    }

    if (next === TILE_TYPES.SCAFFOLD) {
      moveRobot();
      movementCount++;
    }
  }
};

const convertToAscii = input => input.split('').map(i => i.charCodeAt(0));

const setupMovementRules = () => {
  /*
  Path
  L8,R10,L8,R8,L12,R8,R8,L8,R10,L8,R8,L8,R6,R6,R10,L8,L8,R6,R6,R10,L8,L8,R10,L8,R8,L12,R8,R8,L8,R6,R6,R10,L8,L12,R8,R8,L12,R8,R8
  A
  L8,R10,L8,R8
  B
  L12,R8,R8
  C
  L8,R6,R6,R10,L8
  Routine
  A,B,A,C,C,A,B,C,B,B
  */

  const mainRoutine = 'A,B,A,C,C,A,B,C,B,B';
  const functionA = 'L,8,R,10,L,8,R,8';
  const functionB = 'L,12,R,8,R,8';
  const functionC = 'L,8,R,6,R,6,R,10,L,8';
  const newLine = '\n'.charCodeAt(0);
  const videoFeed = VIDEO_FEED_ENABLED ? 'y' : 'n';

  state.input.push(...convertToAscii(mainRoutine), newLine);
  state.input.push(...convertToAscii(functionA), newLine);
  state.input.push(...convertToAscii(functionB), newLine);
  state.input.push(...convertToAscii(functionC), newLine);
  state.input.push(videoFeed.charCodeAt(0), newLine);
};

const run = () => {
  parseInput();

  if (state.findPath) {
    runProgram();
    buildGrid();
    drawGrid();
    calculatePath();
  } else {
    setupMovementRules();
    state.program[0] = 2;
    runProgram();
  }
};

run();
console.log(`The vacuum robot collected ${state.output[state.output.length - 1]} dust`);

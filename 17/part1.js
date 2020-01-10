const fs = require('fs');

const FILE_NAME = 'input';

const MODES = {
  POSITION: 0,
  IMMEDIATE: 1,
  RELATIVE: 2
};

const TILE_TYPES = {
  SCAFFOLD: '#',
  SPACE: '.'
};

const state = {
  input: null,
  output: [],
  program: [],
  cursor: 0,
  programRunning: true,
  relativeBase: 0,
  grid: {},
  intersections: []
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
      setParameter(mode1, output, state.input);
      state.cursor += 2;
    }

    if (opcode === 4) {
      const output = state.program[state.cursor + 1];
      state.output.push(getParameter(mode1, output));
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
      const isIntersection = state.intersections.includes(toKey(x, y));
      line.push(isIntersection ? 'O' : state.grid[toKey(x, y)]);
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

const getAdjacentTiles = coord => {
  if (state.grid[coord] !== TILE_TYPES.SCAFFOLD) {
    return [];
  }

  const [ x, y ] = toCoordinates(coord);
  const adjacentCoords = [
    `${x + 1},${y}`,
    `${x},${y + 1}`,
    `${x - 1},${y}`,
    `${x},${y - 1}`
  ];
  return adjacentCoords.filter(coord => state.grid[coord] === TILE_TYPES.SCAFFOLD);
}

const findIntersections = () => {
  Object.keys(state.grid).forEach(key => {
    const adjacentTiles = getAdjacentTiles(key);
    if (adjacentTiles.length === 4) {
      state.intersections.push(key);
    }
  });
};

const run = () => {
  parseInput();
  runProgram();
  buildGrid();
  findIntersections();
  // drawGrid();

  state.alignmentParameters = state.intersections.reduce(
    (acc, key) => {
      const [x, y] = toCoordinates(key);
      return acc + (x * y);
    },
    0
  );
};

run();
console.log(`The sum of all alignment parameters is ${state.alignmentParameters}`);

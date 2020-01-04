const fs = require('fs');

const FILE_NAME = 'input';

const DEBUG = process.env.DEBUG === 'true';

const MODES = {
  POSITION: 0,
  IMMEDIATE: 1,
  RELATIVE: 2
};

const INPUT_DIRECTIONS = {
  NORTH: 1,
  SOUTH: 2,
  WEST: 3,
  EAST: 4
};

const ORDERED_DIRECTIONS = [
  INPUT_DIRECTIONS.NORTH,
  INPUT_DIRECTIONS.EAST,
  INPUT_DIRECTIONS.SOUTH,
  INPUT_DIRECTIONS.WEST,
];

const DROID_STATUSES = {
  OBSTRUCTED: 0,
  MOVED: 1,
  FOUND_OXYGEN: 2
};

const TILE_TYPES = {
  EMPTY: 0,
  WALL: 1,
  OXYGEN: 2
};

const state = {
  input: INPUT_DIRECTIONS.NORTH,
  output: null,
  program: [],
  cursor: 0,
  programRunning: true,
  relativeBase: 0,
  grid: {
    '0,0': 0
  },
  droid: {
    x: 0,
    y: 0,
    direction: INPUT_DIRECTIONS.NORTH,
    distance: 0,
    visited: ['0,0']
  },
  oxygenSystem: {
    minutesRun: 0
  }
};

const log = (...args) => DEBUG && console.log(...args);

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

const getFriendlyDirection = direction => {
  switch (direction) {
    case INPUT_DIRECTIONS.NORTH: {
      return 'NORTH';
    }
    case INPUT_DIRECTIONS.EAST: {
      return 'EAST';
    }
    case INPUT_DIRECTIONS.SOUTH: {
      return 'SOUTH';
    }
    case INPUT_DIRECTIONS.WEST: {
      return 'WEST';
    }
  }
}

const getNewPosition = () => {
  const directionMoved = state.droid.direction;

  switch (directionMoved) {
    case INPUT_DIRECTIONS.NORTH: {
      return {
        x: state.droid.x,
        y: state.droid.y - 1
      };
    }
    case INPUT_DIRECTIONS.EAST: {
      return {
        x: state.droid.x + 1,
        y: state.droid.y
      };
    }
    case INPUT_DIRECTIONS.SOUTH: {
      return {
        x: state.droid.x,
        y: state.droid.y + 1
      };
    }
    case INPUT_DIRECTIONS.WEST: {
      return {
        x: state.droid.x - 1,
        y: state.droid.y
      };
    }
  }
};

const rotateAnticlockwise = (clockwise = false) => {
  const currentDirectionIndex = ORDERED_DIRECTIONS.indexOf(state.droid.direction);
  const pointsToAdd = clockwise ? 1 : 3;
  const newDirectionIndex = (currentDirectionIndex + pointsToAdd) % 4;
  state.droid.direction = ORDERED_DIRECTIONS[newDirectionIndex];
  state.input = state.droid.direction;
  log('ROTATING', getFriendlyDirection(state.droid.direction));
};

const rotateClockwise = () => rotateAnticlockwise(true);

const toCoordinates = key => key.split(',').map(n => parseInt(n, 10));

const drawGrid = () => {
  if (!DEBUG) {
    return;
  }

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
      const isOrigin = x === 0 && y === 0;
      const isDroid = x === state.droid.x && y === state.droid.y;
      const isWall = state.grid[`${x},${y}`] === TILE_TYPES.WALL;
      const isOxygen = state.grid[`${x},${y}`] === TILE_TYPES.OXYGEN;
      const isVisited = state.grid[`${x},${y}`] === TILE_TYPES.EMPTY;
      line.push(
        isOxygen ? 'O' :
        isDroid ? 'D' :
        isOrigin ? '.' :
        isVisited ? '+' :
        isWall ? '#' :
        ' '
      );
    }
    console.log(line.join(''));
  }
};

const parseOutput = () => {
  drawGrid();

  const newPosition = getNewPosition();
  const newCoordinate = `${newPosition.x},${newPosition.y}`;

  log();
  log('Current position:', `${state.droid.x},${state.droid.y}`);
  log('Current direction:', getFriendlyDirection(state.droid.direction));
  log('New position:', newCoordinate);

  if (state.output === DROID_STATUSES.OBSTRUCTED) {
    log('HIT WALL AT', newCoordinate);
    state.grid[newCoordinate] = TILE_TYPES.WALL;

    rotateClockwise();
    return;
  }

  state.droid.x = newPosition.x;
  state.droid.y = newPosition.y;

  state.droid.visited.push(newCoordinate);

  rotateAnticlockwise();

  state.grid[newCoordinate] = TILE_TYPES.EMPTY;

  if (newPosition.x === 0 && newPosition.y === 0) {
    log('RETURNED TO START');
    state.programRunning = false;
  }

  if (state.output === DROID_STATUSES.FOUND_OXYGEN) {
    log('OXYGEN FOUND AT', newCoordinate);
    state.oxygenSystem.x = newPosition.x;
    state.oxygenSystem.y = newPosition.y;
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
      state.output = getParameter(mode1, output);
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

const getTilesByType = type => Object.keys(state.grid).filter(
  tile => state.grid[tile] === type
);

const getAdjacentTiles = coord => {
  const [ x, y ] = toCoordinates(coord);
  const adjacentCoords = [
    `${x + 1},${y}`,
    `${x},${y + 1}`,
    `${x - 1},${y}`,
    `${x},${y - 1}`
  ];
  return adjacentCoords.filter(coord => state.grid[coord] === TILE_TYPES.EMPTY);
}

const spreadOxygen = () => {
  const oxygenSystemCoords = `${state.oxygenSystem.x},${state.oxygenSystem.y}`
  state.grid[oxygenSystemCoords] = TILE_TYPES.OXYGEN;

  while (getTilesByType(TILE_TYPES.EMPTY).length) {
    const oxygenTiles = getTilesByType(TILE_TYPES.OXYGEN);

    oxygenTiles.forEach(tile => {
      const adjacentTiles = getAdjacentTiles(tile);
      adjacentTiles.forEach(adjacentTile => {
        state.grid[adjacentTile] = TILE_TYPES.OXYGEN;
      });
    })

    drawGrid();
    state.oxygenSystem.minutesRun++;
  }
};

const run = () => {
  parseInput();
  runProgram();
  spreadOxygen();
};

run();
console.log(`It took ${state.oxygenSystem.minutesRun} minutes to fill the area with oxygen`);

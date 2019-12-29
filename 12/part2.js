const fs = require('fs');

const FILE_NAME = './12/input';

const state = {
  moons: [],
  initialMoons: [],
  repeatedIndex: {},
  pairs: [],
  simulationsRun: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  const rawMoons = input.split('\n');

  rawMoons.forEach(moon => {
    const [_, x, y, z] = moon.match(/^<x=(-?\d+),\sy=(-?\d+),\sz=(-?\d+)>$/);
    state.moons.push({
      position: { x: parseInt(x), y: parseInt(y), z: parseInt(z) },
      velocity: { x: 0, y: 0, z: 0 }
    });
    state.initialMoons.push({
      position: { x: parseInt(x), y: parseInt(y), z: parseInt(z) },
      velocity: { x: 0, y: 0, z: 0 }
    });
  });
};

const calculatePairs = () => {
  for (let i = 0; i < state.moons.length; i++) {
    for (let j = 0; j < state.moons.length; j++) {
      if (i === j) {
        break;
      }
      if (state.pairs.includes([i, j]) || state.pairs.includes([j, i])) {
        break;
      }
      state.pairs.push([i, j]);
    }
  }
};

const calculateVelocityChange = (a, b) => {
  if (a > b) return -1;
  if (b > a) return 1;
  return 0;
}

const applyGravity = () => {
  state.pairs.forEach(([i, j]) => {
    const moonA = state.moons[i];
    const moonB = state.moons[j];

    moonA.velocity.x += calculateVelocityChange(moonA.position.x, moonB.position.x);
    moonA.velocity.y += calculateVelocityChange(moonA.position.y, moonB.position.y);
    moonA.velocity.z += calculateVelocityChange(moonA.position.z, moonB.position.z);

    moonB.velocity.x += calculateVelocityChange(moonB.position.x, moonA.position.x);
    moonB.velocity.y += calculateVelocityChange(moonB.position.y, moonA.position.y);
    moonB.velocity.z += calculateVelocityChange(moonB.position.z, moonA.position.z);
  })
};

const updatePositions = () => {
  state.moons.forEach(moon => {
    moon.position.x += moon.velocity.x;
    moon.position.y += moon.velocity.y;
    moon.position.z += moon.velocity.z;
  })
};

const runSimulation = () => {
  applyGravity();
  updatePositions();
};

const haveFoundRepeat = () => {
  const { x, y, z } = state.repeatedIndex;
  return x && y && z;
};

const matchesInitialState = dimension => {
  return state.moons.every((moon, index) =>
    moon.position[dimension] === state.initialMoons[index].position[dimension] &&
    moon.velocity[dimension] === state.initialMoons[index].velocity[dimension]
  );
};

const checkForRepeats = () => {
  if (matchesInitialState('x')) {
    state.repeatedIndex.x = state.simulationsRun;
  }
  if (matchesInitialState('y')) {
    state.repeatedIndex.y = state.simulationsRun;
  }
  if (matchesInitialState('z')) {
    state.repeatedIndex.z = state.simulationsRun;
  }
};

const greatestCommonDivisor = (a, b) => {
  if (b === 0) {
    return a;
  }
  return greatestCommonDivisor(b, a % b);
};

const leastCommonMultiple = (a, b) => {
  return a * b / greatestCommonDivisor(a, b);
};

const findTotalRepeatedIndex = () => {
  const { x, y, z } = state.repeatedIndex;

  return leastCommonMultiple(
    leastCommonMultiple(x, y), z
  );
};

const run = () => {
  parseInput();
  calculatePairs();

  while (!haveFoundRepeat()) {
    runSimulation();
    state.simulationsRun++;

    checkForRepeats();
  }

  state.totalRepeatedSteps = findTotalRepeatedIndex();
};

run();
console.log(`It takes ${state.totalRepeatedSteps} steps to reach a previously seen state`);

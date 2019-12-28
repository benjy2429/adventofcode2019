const fs = require('fs');

const FILE_NAME = './12/input';

const MAX_SIMULATIONS = 1000;

const state = {
  moons: [],
  pairs: [],
  simulationsRun: 0,
  totalEnergy: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  const rawMoons = input.split('\n');

  rawMoons.forEach(moon => {
    const [_, x, y, z] = moon.match(/^<x=(-?\d+),\sy=(-?\d+),\sz=(-?\d+)>$/);
    state.moons.push({
      position: {
        x: parseInt(x),
        y: parseInt(y),
        z: parseInt(z)
      },
      velocity: {
        x: 0,
        y: 0,
        z: 0
      }
    })
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

const calculateTotalEnergy = () => {
  state.totalEnergy = state.moons.reduce(
    (acc, { position, velocity }) => {
      const potentialEnergy = Math.abs(position.x) + Math.abs(position.y) + Math.abs(position.z);
      const kineticEnergy = Math.abs(velocity.x) + Math.abs(velocity.y) + Math.abs(velocity.z);
      return acc + (potentialEnergy * kineticEnergy);
    },
    0
  );
};

const run = () => {
  parseInput();
  calculatePairs();

  while (state.simulationsRun < MAX_SIMULATIONS) {
    runSimulation();
    state.simulationsRun++;
  }

  calculateTotalEnergy();
};

run();
console.log(`The total energy after ${state.simulationsRun} simulations is ${state.totalEnergy}`);

const fs = require('fs');

const FILE_NAME = './10/input';

const POSITION_TYPES = {
  EMPTY: '.',
  ASTEROID: '#'
};

const state = {
  asteroids: {}
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');

  input.split('\n').map((line, y) => {
    line.split('').map((position, x) => {
      if (position === POSITION_TYPES.ASTEROID) {
        state.asteroids[toKey(x, y)] = null;
      }
    })
  });
};

const toCoordinates = key => key.split(',').map(n => parseInt(n, 10));
const toKey = (x, y) => `${x},${y}`;

const calculateAngle = (x, y) => Math.atan2(y, x) * 180 / Math.PI;

const calculateDistance = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

const calculateDirectPairs = thisAsteroid => {
  const [x1, y1] = toCoordinates(thisAsteroid);

  const otherAsteroids = Object.keys(state.asteroids)
    .filter(a => thisAsteroid !== a)
    .map(otherAsteroid => {
      const [x2, y2] = toCoordinates(otherAsteroid);
      return {
        x: x2,
        y: y2,
        angle: calculateAngle(x2 - x1, y2 - y1),
        distance: calculateDistance(x1, y1, x2, y2)
      };
    });

  const indirectAsteroidIndices = otherAsteroids.reduce(
    (acc, a, index) => {
      const closerAsteroid = otherAsteroids.find(
        a2 => a2.angle === a.angle && a2.distance < a.distance
      );

      if (closerAsteroid) {
        acc.push(index);
      }
      return acc;
    },
    []
  );

  const directAsteroids = otherAsteroids.filter(
    (a, index) => !indirectAsteroidIndices.includes(index)
  );

  return directAsteroids.length;
}

const run = () => {
  parseInput();

  Object.keys(state.asteroids).forEach(asteroid => {
    state.asteroids[asteroid] = calculateDirectPairs(asteroid);
  });

  state.bestAsteroidLocation = Object.values(state.asteroids).reduce(
    (acc, a) => acc < a ? a : acc,
    0
  );
};

run();
console.log(`${state.bestAsteroidLocation} asteroids can be detected from the best location`);

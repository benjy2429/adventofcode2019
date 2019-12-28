const fs = require('fs');

const FILE_NAME = './10/input';

const VAPORIZE_TARGET = 200;

const POSITION_TYPES = {
  EMPTY: '.',
  ASTEROID: '#'
};

const state = {
  asteroids: {},
  asteroidsVaporized: 0
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

const normalizeAngle = angle => (angle + 360 + 90) % 360;

const calculateDistance = (x1, y1, x2, y2) => Math.abs(x1 - x2) + Math.abs(y1 - y2);

const findDirectAsteroids = asteroids => {
  const indirectAsteroidIndices = asteroids.reduce(
    (acc, a, index) => {
      const closerAsteroid = asteroids.find(
        a2 => a2.angle === a.angle && a2.distance < a.distance
      );

      if (closerAsteroid) {
        acc.push(index);
      }
      return acc;
    },
    []
  );

  const directAsteroids = asteroids.map(
    (a, index) => ({
      ...a,
      direct: !indirectAsteroidIndices.includes(index)
    })
  );

  return directAsteroids;
}

const calculateDirectPairs = thisAsteroid => {
  const [x1, y1] = toCoordinates(thisAsteroid);

  const otherAsteroids = Object.keys(state.asteroids)
    .filter(a => thisAsteroid !== a)
    .map(otherAsteroid => {
      const [x2, y2] = toCoordinates(otherAsteroid);
      return {
        x: x2,
        y: y2,
        angle: normalizeAngle(calculateAngle(x2 - x1, y2 - y1)),
        distance: calculateDistance(x1, y1, x2, y2)
      };
    });

  const directAsteroids = findDirectAsteroids(otherAsteroids);

  state.asteroids[thisAsteroid] = directAsteroids;
};

const findBestLocation = () => {
  Object.keys(state.asteroids).forEach(asteroid => {
    calculateDirectPairs(asteroid);
  });

  state.bestAsteroidLocation = Object.keys(state.asteroids)
    .reduce(
      (acc, a) => {
        if (!acc) {
          return a;
        }

        const directAsteroidsA = state.asteroids[acc].filter(a => a.direct);
        const directAsteroidsB = state.asteroids[a].filter(a => a.direct);
        return directAsteroidsA.length < directAsteroidsB.length ? a : acc
      },
      null
    );

  state.targetAsteroids = state.asteroids[state.bestAsteroidLocation];
};

const vaporizeAsteroids = () => {
  while (state.asteroidsVaporized < VAPORIZE_TARGET) {
    const remainingAsteroids = state.targetAsteroids
      .map((a, index) => ({ ...a, index }))
      .filter(a => !a.vaporizedIndex);

    const asteroidsToVaporize = findDirectAsteroids(remainingAsteroids)
      .filter(a => a.direct)
      .sort((a, b) => a.angle - b.angle);

    asteroidsToVaporize.forEach(asteroid => {
      state.asteroidsVaporized++;
      state.targetAsteroids[asteroid.index].vaporizedIndex = state.asteroidsVaporized;
    });
  }
};

const run = () => {
  parseInput();
  findBestLocation();
  vaporizeAsteroids();

  state.twoHundredthAsteroidVaporized = state.targetAsteroids.find(
    a => a.vaporizedIndex === 200
  );
};

run();
console.log(`The 200th asteroid to be vaporized will be ${(state.twoHundredthAsteroidVaporized.x * 100) + state.twoHundredthAsteroidVaporized.y}`);

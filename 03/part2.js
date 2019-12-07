const fs = require('fs');

const FILE_NAME = './03/input';

const state = {
  wires: [],
  grid: {},
  currentPosition: [0, 0],
  runningDistance: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  const wires = input.split('\n');
  state.wires = wires.map(wire => wire.split(','));
};

const calculateNewCoordinate = (x, y, direction) => {
  switch (direction) {
    case 'U': return [x, y + 1];
    case 'D': return [x, y - 1];
    case 'L': return [x - 1, y];
    case 'R': return [x + 1, y];
    default: throw new Error('Unknown direction:', direction)
  }
}

const tracePath = (wireId, path) => {
  const direction = path.slice(0, 1);
  let remainingDistance = path.slice(1);

  while (remainingDistance > 0) {
    state.runningDistance++;
    const [currentX, currentY] = state.currentPosition;
    const [newX, newY] = calculateNewCoordinate(currentX, currentY, direction);
    const coord = `${newX},${newY}`;

    state.grid[coord] = state.grid[coord] || [];
    if (!state.grid[coord].find(({ id }) => id === wireId)) {
      state.grid[coord].push({
        id: wireId,
        distance: state.runningDistance
      });
    }
    state.currentPosition = [newX, newY];
    remainingDistance--;
  }
}

const findIntersections = () => Object.keys(state.grid)
  .filter(coord => state.grid[coord].length > 1)
  .map(coord => state.grid[coord])

const calculateDistance = (i, j) => i.distance + j.distance;

const run = () => {
  parseInput();

  state.wires.forEach((wire, index) => {
    state.currentPosition = [0, 0];
    state.runningDistance = 0;
    wire.forEach(path => {
      tracePath(index, path);
    })
  });

  const intersections = findIntersections();
  const distances = intersections
    .map(([i, j]) => calculateDistance(i, j))
    .sort((x, y) => x - y);

  return distances[0];
};

const shortestDistance = run();
console.log(`The distance from the central port to the closest intersection is ${shortestDistance}`);

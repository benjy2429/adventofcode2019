const fs = require('fs');

const FILE_NAME = './01/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const modules = file.split('\n');

const fuelNeeded = modules.reduce(
  (acc, mass) => acc + (Math.floor(mass / 3) - 2),
  0
);

console.log(`Total fuel needed is: ${fuelNeeded}`);

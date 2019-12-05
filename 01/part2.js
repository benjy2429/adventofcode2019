const fs = require('fs');

const FILE_NAME = './01/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const modules = file.split('\n');

const calculateFuelNeeded = mass => {
  let totalFuelNeeded = 0;
  let remainingMass = mass;

  while (remainingMass > 0) {
    const newMass = Math.floor(remainingMass / 3) - 2;
    if (newMass > 0) {
      totalFuelNeeded += newMass;
    }
    remainingMass = newMass;
  }

  return totalFuelNeeded;
};

const totalFuel = modules.reduce(
  (acc, module) => acc + calculateFuelNeeded(module),
  0
);


console.log(`Total fuel needed is: ${totalFuel}`);

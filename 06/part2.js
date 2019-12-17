const fs = require('fs');

const FILE_NAME = './06/input';

const state = {
  orbitsData: [],
  orbits: {},
  totalOrbits: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  state.orbitsData = input.split('\n');
};

const determinePlanets = () => {
  state.orbitsData.forEach(orbit => {
    const [a, b] = orbit.split(')');
    state.orbits[a] = { directOrbits: [], indirectOrbits: [] };
    state.orbits[b] = { directOrbits: [], indirectOrbits: [] };
  });
};

const determineOrbits = () => {
  state.orbitsData.forEach(orbit => {
    const [a, b] = orbit.split(')');
    state.orbits[b].directOrbits.push(a);
  });

  Object.keys(state.orbits).forEach(planet => {
    const indirectOrbits = findOrbits(planet);
    state.orbits[planet].indirectOrbits = indirectOrbits;
  });
};

const findOrbits = planet => {
  const { directOrbits } = state.orbits[planet];

  return [
    ...directOrbits,
    ...directOrbits.reduce(
      (acc, child) => [...acc, ...findOrbits(child)],
      []
    )
  ];
};

const run = () => {
  parseInput();
  determinePlanets();
  determineOrbits();

  const youOrbits = state.orbits.YOU.indirectOrbits;
  const santaOrbits = state.orbits.SAN.indirectOrbits;

  const firstCommonPlanet = youOrbits.find(planet => santaOrbits.includes(planet));
  state.minimumTransfers = youOrbits.indexOf(firstCommonPlanet) + santaOrbits.indexOf(firstCommonPlanet);
};

run();
console.log(`The minimum number of orbital transfers required to reach Santa is ${state.minimumTransfers}`);

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
}

const determineOrbits = () => {
  state.orbitsData.forEach(orbit => {
    const [a, b] = orbit.split(')');
    state.orbits[b].directOrbits.push(a);
  });

  Object.keys(state.orbits).forEach(planet => {
    const indirectOrbits = findOrbits(planet);
    state.orbits[planet].indirectOrbits = indirectOrbits;
  });
}

const findOrbits = planet => {
  const { directOrbits } = state.orbits[planet];

  return [
    ...directOrbits,
    ...directOrbits.reduce(
      (acc, child) => [...acc, ...findOrbits(child)],
      []
    )
  ];
}

const run = () => {
  parseInput();
  determinePlanets();
  determineOrbits();

  state.totalOrbits = Object.keys(state.orbits).reduce(
    (acc, planet) => [...acc, ...state.orbits[planet].indirectOrbits],
    []
  );
};

run();
console.log(`The total number of direct and indirect orbits is ${state.totalOrbits.length}`);

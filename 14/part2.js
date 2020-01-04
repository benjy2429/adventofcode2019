const fs = require('fs');

const FILE_NAME = 'input';

const AVAILABLE_ORE = 1000000000000;

const input = `157 ORE => 5 NZVS
165 ORE => 6 DCFZ
44 XJWVT, 5 KHKGT, 1 QDVJ, 29 NZVS, 9 GPVTF, 48 HKGWZ => 1 FUEL
12 HKGWZ, 1 GPVTF, 8 PSHF => 9 QDVJ
179 ORE => 7 PSHF
177 ORE => 5 HKGWZ
7 DCFZ, 7 PSHF => 2 XJWVT
165 ORE => 2 GPVTF
3 DCFZ, 7 NZVS, 5 HKGWZ, 10 PSHF => 8 KHKGT`;

const CHEMICALS = {
  ORE: 'ORE',
  FUEL: 'FUEL'
}

const state = {
  reactions: {},
  usedChemicals: {},
  mostFuel: 0,
  oreUsedPerCycle: 0
};

const parseInput = () => {
  // const input = fs.readFileSync(`${__dirname}/${FILE_NAME}`, 'utf8');

  input.split('\n').forEach(rawReaction => {
    const [rawInput, rawOutput] = rawReaction.split(' => ');

    const rawInputs = rawInput.split(', ');
    const inputs = rawInputs.map(input => {
      const [_, quantity, chemical] = input.match(/^(\d+) ([A-Z]+)$/);
      return {
        chemical,
        quantity: parseInt(quantity, 10)
      };
    })

    const [_, outputQuantity, outputChemical] = rawOutput.match(/^(\d+) ([A-Z]+)$/);

    state.reactions[outputChemical] = {
      quantity: parseInt(outputQuantity, 10),
      inputs
    };
  });
};

const resolveInputs = (chemical) => {
  const { quantity: reactionQuantity, inputs } = state.reactions[chemical];

  inputs.forEach(input => {
    const { chemical: inputChemical, quantity: inputQuantity } = input;
    state.usedChemicals[inputChemical] = state.usedChemicals[inputChemical] || 0;
    state.usedChemicals[inputChemical] += inputQuantity;
  });

  state.usedChemicals[chemical] -= reactionQuantity;
};

const allChemicalsResolved = () => {
  const remainingChemicals = Object.keys(state.usedChemicals)
    .filter(c => state.usedChemicals[c] > 0);

  return remainingChemicals.length === 1 && remainingChemicals[0] === CHEMICALS.ORE;
};

const cycleRepeated = () => Object.keys(state.usedChemicals)
  .filter(c => c !== CHEMICALS.ORE)
  .every(c => state.usedChemicals[c] === 0);

const run = () => {
  parseInput();
  state.usedChemicals[CHEMICALS.FUEL] = 1;
  state.usedChemicals[CHEMICALS.ORE] = 0;

  while (!cycleRepeated()) {
    // console.log(Object.keys(state.usedChemicals)
    //   .filter(c => c !== CHEMICALS.ORE)
    //   .map(c => state.usedChemicals[c]));
    while (!allChemicalsResolved()) {
      const [nextChemical] = Object.keys(state.usedChemicals)
        .filter(c => state.usedChemicals[c] > 0 && c !== CHEMICALS.ORE);

      resolveInputs(nextChemical);
    }

    if (state.usedChemicals[CHEMICALS.ORE] < AVAILABLE_ORE) {
      state.mostFuel += 1;
    }

    state.usedChemicals[CHEMICALS.FUEL] += 1;
    process.exit();
  }

  console.log(state.usedChemicals);

  state.oreUsedPerCycle = state.usedChemicals[CHEMICALS.ORE];

  console.log(state.oreUsedPerCycle);
};

console.time('timer');
run();
console.timeEnd('timer');
console.log(`1 trillion ORE can produce a maximum of ${state.mostFuel} FUEL`);

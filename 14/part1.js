const fs = require('fs');

const FILE_NAME = 'input';

const CHEMICALS = {
  ORE: 'ORE',
  FUEL: 'FUEL'
}

const state = {
  reactions: {},
  usedChemicals: {}
};

const parseInput = () => {
  const input = fs.readFileSync(`${__dirname}/${FILE_NAME}`, 'utf8');

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

const run = () => {
  parseInput();
  state.usedChemicals['FUEL'] = 1;

  while (!allChemicalsResolved()) {
    const [nextChemical] = Object.keys(state.usedChemicals)
      .filter(c => state.usedChemicals[c] > 0 && c !== CHEMICALS.ORE);

    resolveInputs(nextChemical);
  }
};

run();
console.log(`1 FUEL requires a minimum of ${state.usedChemicals[CHEMICALS.ORE]} ORE`);

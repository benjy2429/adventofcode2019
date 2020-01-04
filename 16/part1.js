const fs = require('fs');

const FILE_NAME = 'input';

const MAX_PHASES = 100;

const BASE_PATTERN = [0,1,0,-1];

const state = {
  input: [],
  output: [],
  phase: 0
};

const parseInput = () => {
  const input = fs.readFileSync(`${__dirname}/${FILE_NAME}`, 'utf8');
  state.input = input.split('').map(x => parseInt(x, 10));
};

const calculatePattern = index => {
  return BASE_PATTERN.reduce(
    (acc, patternValue) => [
      ...acc,
      ...Array.from(Array(index + 1), () => patternValue),
    ],
    []
  );
};

const calculateOutput = index => {
  const pattern = calculatePattern(index);

  const outputValue = state.input.reduce(
    (acc, inputValue, index) => {
      const patternIndex = (index + 1) % pattern.length;
      return acc + (inputValue * pattern[patternIndex]);
    },
    0
  );

  return outputValue.toString().split('').pop();
};

const ftt = () => {
  while (state.phase < MAX_PHASES) {
    state.phase++;
    state.input = state.input.map((_, i) => calculateOutput(i));
  }
};

const run = () => {
  parseInput();
  ftt();

  state.answer = state.input.slice(0, 8).join('');
};

run();
console.log(`The first 8 digits of the output list are ${state.answer}`);

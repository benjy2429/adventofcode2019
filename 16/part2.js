const fs = require('fs');

const FILE_NAME = 'input';
const MAX_PHASES = 100;
const BASE_PATTERN = [0,1,0,-1];

const state = {
  input: [],
  output: [],
  phase: 0,
  offset: 0
};

const parseInput = () => {
  const input = fs.readFileSync(`${__dirname}/${FILE_NAME}`, 'utf8');
  state.input = input.repeat(10000).split('').map(x => parseInt(x, 10));

  state.offset = parseInt(
    state.input.slice(0, 7).join(''),
    10
  );
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
  let acc = 0;

  for (let i = 0; i < state.input.length; i++) {
    const patternIndex = (i + 1) % pattern.length;
    acc += (state.input[i] * pattern[patternIndex]);
  }

  return acc.toString().split('').pop();
};

const ftt = () => {
  while (state.phase < MAX_PHASES) {
    state.phase++;
    const output = Array(state.input.length);

    for (let i = 0; i < state.input.length; i++) {
      output[i] = calculateOutput(i);
    }

    state.input = output;
  }
};

const run = () => {
  parseInput();
  ftt();

  state.answer = state.input.slice(state.offset, state.offset + 8).join('');
};

run();
console.log(`The first 8 digits of the output list are ${state.answer}`);

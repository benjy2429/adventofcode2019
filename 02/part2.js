const fs = require('fs');

const FILE_NAME = './02/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const input = file.split(',').map(n => parseInt(n, 10));

const FINAL_OUTPUT = 19690720;

const state = {
  initialState: input,
  noun: 0,
  verb: 0,
  program: [],
  cursor: 0,
  programRunning: true,
  answerFound: false
};

const runProgram = () => {
  state.programRunning = true;
  state.cursor = 0;

  while (state.programRunning) {
    const opcode = state.program[state.cursor];

    if (opcode === 99) {
      state.programRunning = false;
      continue;
    }

    const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
    if (opcode === 1) {
      state.program[output] = state.program[i] + state.program[j];
    }

    if (opcode === 2) {
      state.program[output] = state.program[i] * state.program[j];
    }

    state.cursor += 4;
  }
}

const run = () => {
  while (!state.answerFound) {
    console.log('Running with noun:', state.noun, 'and verb:', state.verb);
    state.program = Array.from(state.initialState);
    state.program[1] = state.noun;
    state.program[2] = state.verb;

    runProgram();

    if (state.program[0] === FINAL_OUTPUT) {
      state.answerFound = true;
      break;
    }

    if (state.noun === 99) {
      state.noun = 0;
      state.verb++;
    } else {
      state.noun++;
    }
  }
};

run();
console.log(`100 * noun + verb: ${100 * state.noun + state.verb}`);

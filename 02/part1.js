const fs = require('fs');

const FILE_NAME = './02/input';

const file = fs.readFileSync(FILE_NAME, 'utf8');
const input = file.split(',').map(n => parseInt(n, 10));

const state = {
  program: input,
  cursor: 0,
  running: true
};

const run = () => {
  state.program[1] = 12;
  state.program[2] = 2;

  while (state.running) {
    const opcode = state.program[state.cursor];

    if (opcode === 99) {
      state.running = false;
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
};

run();
console.log(`Position 0 of the program is: ${state.program[0]}`);

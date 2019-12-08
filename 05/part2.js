const fs = require('fs');

const FILE_NAME = './05/input';
const PROGRAM_INPUT = 5;

const MODES = {
  POSITION: 0,
  IMMEDIATE: 1
};

const state = {
  input: PROGRAM_INPUT,
  output: [],
  program: [],
  cursor: 0,
  programRunning: true,
  answerFound: false
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  state.program = input.split(',').map(x => parseInt(x, 10));
};

const parseInstruction = instruction => {
  const [mode3, mode2, mode1, opcode1, opcode2] = `00000${instruction}`.substr(-5);
  return [
    parseInt(`${opcode1}${opcode2}`, 10),
    parseInt(mode1, 10),
    parseInt(mode2, 10),
    parseInt(mode3, 10),
  ]
};

const getParameter = (mode, address) => mode === MODES.POSITION ? state.program[address] : address;

const runProgram = () => {
  state.programRunning = true;
  state.cursor = 0;
  let i = 0;

  while (state.programRunning) {
    i++;
    const instruction = state.program[state.cursor];
    const [opcode, mode1, mode2, mode3] = parseInstruction(instruction)

    // if (i === 10) process.exit()

    if (opcode === 99) {
      state.programRunning = false;
      continue;
    }

    if (opcode === 1) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      state.program[output] = getParameter(mode1, i) + getParameter(mode2, j);
      state.cursor += 4;
    }

    if (opcode === 2) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      state.program[output] = getParameter(mode1, i) * getParameter(mode2, j);
      state.cursor += 4;
    }

    if (opcode === 3) {
      const output = state.program[state.cursor + 1];
      state.program[output] = state.input;
      state.cursor += 2;
    }

    if (opcode === 4) {
      const output = state.program[state.cursor + 1];
      state.output.push(getParameter(mode1, output));
      state.cursor += 2;
    }

    if (opcode === 5) {
      const [i, j] = state.program.slice(state.cursor + 1, state.cursor + 3);
      if (getParameter(mode1, i) !== 0) {
        state.cursor = getParameter(mode2, j);
      } else {
        state.cursor += 3;
      }
    }

    if (opcode === 6) {
      const [i, j] = state.program.slice(state.cursor + 1, state.cursor + 3);
      if (getParameter(mode1, i) === 0) {
        state.cursor = getParameter(mode2, j);
      } else {
        state.cursor += 3;
      }
    }

    if (opcode === 7) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      state.program[output] = getParameter(mode1, i) < getParameter(mode2, j) ? 1 : 0;
      state.cursor += 4;
    }

    if (opcode === 8) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      state.program[output] = getParameter(mode1, i) === getParameter(mode2, j) ? 1 : 0;
      state.cursor += 4;
    }
  }
}

const run = () => {
  parseInput();
  runProgram();
};

run();
console.log(`The program's diagnostic code was ${state.output[state.output.length - 1]}`);

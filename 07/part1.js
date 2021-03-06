const fs = require('fs');

const FILE_NAME = './07/input';

const MODES = {
  POSITION: 0,
  IMMEDIATE: 1
};

const state = {
  input: [0, 0],
  inputCursor: 0,
  output: [],
  originalProgram: [],
  program: [],
  cursor: 0,
  programRunning: true,
  maxThruster: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  state.originalProgram = input.split(',').map(x => parseInt(x, 10));
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
  state.program = [...state.originalProgram];
  state.programRunning = true;
  state.cursor = 0;
  state.inputCursor = 0;

  while (state.programRunning) {
    const instruction = state.program[state.cursor];
    const [opcode, mode1, mode2, mode3] = parseInstruction(instruction)

    if (opcode === 99) {
      state.programRunning = false;
      continue;
    }

    if (opcode === 1) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      state.program[output] = getParameter(mode1, i) + getParameter(mode2, j);
      state.cursor += 4;
      continue;
    }

    if (opcode === 2) {
      const [i, j, output] = state.program.slice(state.cursor + 1, state.cursor + 4);
      state.program[output] = getParameter(mode1, i) * getParameter(mode2, j);
      state.cursor += 4;
      continue;
    }

    if (opcode === 3) {
      const output = state.program[state.cursor + 1];
      state.program[output] = state.input[state.inputCursor];
      state.inputCursor += 1;
      state.cursor += 2;
      continue;
    }

    if (opcode === 4) {
      const output = state.program[state.cursor + 1];
      state.output.push(state.program[output]);
      state.cursor += 2;
      continue;
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
};

const generateSequenceCombinations = () => {
  state.sequences = [[]];

  while (state.sequences[0].length < 5) {
    state.sequences = state.sequences.reduce(
      (acc, sequence) => {
        [0,1,2,3,4].forEach(phase => {
          if (!sequence.includes(phase)) {
            acc.push([phase, ...sequence]);
          }
        })
        return acc;
      },
      []
    );
  }
};

const run = () => {
  parseInput();
  generateSequenceCombinations();

  state.sequences.forEach(sequence => {
    state.input = [0, 0];
    state.output = [];

    sequence.forEach(phase => {
      state.input[0] = phase;
      runProgram();
      state.input[1] = state.output[state.output.length - 1];
    });

    const thrusterSignal = state.output[state.output.length - 1];
    if (thrusterSignal > state.maxThruster) {
      state.maxThruster = thrusterSignal;
    }
  });
};

run();
console.log(`The highest possible thruster signal is ${state.maxThruster}`);

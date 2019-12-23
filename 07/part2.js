const fs = require('fs');

const FILE_NAME = './07/input';

const MODES = {
  POSITION: 0,
  IMMEDIATE: 1
};

const state = {
  currentAmp: 0,
  input: [0, 0],
  output: [],
  originalProgram: [],
  amplifiers: [],
  programRunning: true,
  maxThruster: 0,
  solutionFound: false
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

const getParameter = (mode, address, program) => mode === MODES.POSITION ? program[address] : address;

const runProgram = () => {
  state.programRunning = true;

  const amp = state.amplifiers[state.currentAmp];

  while (state.programRunning) {
    const instruction = amp.program[amp.cursor];
    const [opcode, mode1, mode2, mode3] = parseInstruction(instruction);

    if (opcode === 99) {
      state.programRunning = false;
      state.output.push(state.input[0])
      if (state.currentAmp === 4) {
        state.solutionFound = true;
      }
      continue;
    }

    if (opcode === 1) {
      const [i, j, output] = amp.program.slice(amp.cursor + 1, amp.cursor + 4);
      amp.program[output] = getParameter(mode1, i, amp.program) + getParameter(mode2, j, amp.program);
      amp.cursor += 4;
      continue;
    }

    if (opcode === 2) {
      const [i, j, output] = amp.program.slice(amp.cursor + 1, amp.cursor + 4);
      amp.program[output] = getParameter(mode1, i, amp.program) * getParameter(mode2, j, amp.program);
      amp.cursor += 4;
      continue;
    }

    if (opcode === 3) {
      const output = amp.program[amp.cursor + 1];
      const inputValue = state.input.shift();
      amp.program[output] = inputValue;
      amp.init = true;
      amp.cursor += 2;
      continue;
    }

    if (opcode === 4) {
      const output = amp.program[amp.cursor + 1];
      state.output.push(amp.program[output]);
      amp.cursor += 2;
      state.programRunning = false;
      continue;
    }

    if (opcode === 5) {
      const [i, j] = amp.program.slice(amp.cursor + 1, amp.cursor + 3);
      if (getParameter(mode1, i, amp.program) !== 0) {
        amp.cursor = getParameter(mode2, j, amp.program);
      } else {
        amp.cursor += 3;
      }
      continue;
    }

    if (opcode === 6) {
      const [i, j] = amp.program.slice(amp.cursor + 1, amp.cursor + 3);
      if (getParameter(mode1, i, amp.program) === 0) {
        amp.cursor = getParameter(mode2, j, amp.program);
      } else {
        amp.cursor += 3;
      }
      continue;
    }

    if (opcode === 7) {
      const [i, j, output] = amp.program.slice(amp.cursor + 1, amp.cursor + 4);
      amp.program[output] = getParameter(mode1, i, amp.program) < getParameter(mode2, j, amp.program) ? 1 : 0;
      amp.cursor += 4;
      continue;
    }

    if (opcode === 8) {
      const [i, j, output] = amp.program.slice(amp.cursor + 1, amp.cursor + 4);
      amp.program[output] = getParameter(mode1, i, amp.program) === getParameter(mode2, j, amp.program) ? 1 : 0;
      amp.cursor += 4;
      continue;
    }
  }
};

const generateSequenceCombinations = () => {
  state.sequences = [[]];

  while (state.sequences[0].length < 5) {
    state.sequences = state.sequences.reduce(
      (acc, sequence) => {
        [5,6,7,8,9].forEach(phase => {
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
    state.amplifiers = [
      {
        program: [...state.originalProgram],
        cursor: 0,
        init: false
      },
      {
        program: [...state.originalProgram],
        cursor: 0,
        init: false
      },
      {
        program: [...state.originalProgram],
        cursor: 0,
        init: false
      },
      {
        program: [...state.originalProgram],
        cursor: 0,
        init: false
      },
      {
        program: [...state.originalProgram],
        cursor: 0,
        init: false
      }
    ]
    state.currentAmp = 0;
    state.input = [0];
    state.solutionFound = false;

    while (!state.solutionFound) {
      state.output = [];
      if (!state.amplifiers[state.currentAmp].init) {
        state.input.unshift(sequence[state.currentAmp]);
      }
      runProgram();
      state.input = [...state.output];
      state.currentAmp = (state.currentAmp + 1) % 5
    }

    const thrusterSignal = state.output[0];
    if (thrusterSignal > state.maxThruster) {
      state.maxThruster = thrusterSignal;
      state.maxSequence = sequence;
    }
  });
};

run();
console.log(`The highest possible thruster signal is ${state.maxThruster} with a phase sequence of ${state.maxSequence}`);

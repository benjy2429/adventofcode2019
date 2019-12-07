const fs = require('fs');

const FILE_NAME = './04/input';

const state = {
  low: 0,
  high: 0,
  current: 0
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  const [low, high] = input.split('-').map(x => parseInt(x, 10));
  state.current = low;
  state.low = low;
  state.high = high;
};

const hasTwoAdjacentDigits = current => {
  const pass = current.toString().split('');

  for (let i = 0; i < pass.length - 1; i++) {
    const lastDigit = pass[i - 1];
    const digit1 = pass[i];
    const digit2 = pass[i + 1];
    const digit3 = pass[i + 2];

    if (lastDigit !== digit1 && digit1 === digit2 && digit2 !== digit3) {
      return true;
    }
  }

  return false;
}

const doDigitsIncrease = current => {
  const pass = current.toString().split('');
  let lastDigit;

  for (let i = 0; i < pass.length; i++) {
    const digit = pass[i];
    if (digit < lastDigit) {
      return false;
    }
    lastDigit = digit;
  }

  return true;
}

const run = () => {
  parseInput();

  const possiblePasswords = [...Array(state.high - state.low + 1)]
    .map((x, i) => i + state.low)
    .filter(hasTwoAdjacentDigits)
    .filter(doDigitsIncrease);

  return possiblePasswords.length;
};

const possiblePasswords = run();
console.log(`There are ${possiblePasswords} different passwords that meet the criteria`);

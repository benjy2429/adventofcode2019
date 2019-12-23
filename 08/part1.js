const fs = require('fs');

const FILE_NAME = './08/input';

const WIDTH = 25;
const HEIGHT = 6;

const state = {
  input: [],
  layers: []
};

const parseInput = () => {
  const input = fs.readFileSync(FILE_NAME, 'utf8');
  state.input = input.split('').map(x => parseInt(x, 10));
};

const splitIntoLayers = () => {
  const area = WIDTH * HEIGHT;

  state.input.forEach((pixel, index) => {
    const layer = Math.floor(index / area);
    state.layers[layer] = state.layers[layer] || [];
    state.layers[layer].push(pixel);
  });
};

const run = () => {
  parseInput();
  splitIntoLayers();

  const counts = state.layers.map(layer => {
    const pixelCounts = {};
    layer.forEach(pixel => {
      pixelCounts[pixel] = pixelCounts[pixel] || 0;
      pixelCounts[pixel] += 1;
    });
    return pixelCounts;
  });

  const [layerWithLeastZeros] = counts.sort((a, b) => a[0] - b[0]);
  state.answer = layerWithLeastZeros[1] * layerWithLeastZeros[2];
};

run();
console.log(`From the layer with least 0 digits, the count of 1 digits times 2 digits is ${state.answer}`);

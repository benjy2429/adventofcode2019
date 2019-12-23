const fs = require('fs');

const FILE_NAME = './08/input';

const PIXEL_COLORS = [0,1];

const WIDTH = 25;
const HEIGHT = 6;

const state = {
  input: [],
  layers: [],
  pixels: []
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

const getLayersForPixel = pixelIndex =>
  state.layers.map((_, layerIndex) => state.layers[layerIndex][pixelIndex],);

const getPixelColor = pixelData => {
  for (const pixel of pixelData) {
    if (pixel in PIXEL_COLORS) {
      return pixel;
    }
  }
};

const calculatePixelValues = () => {
  state.layers[0].forEach((_, pixelIndex) => {
    const pixelData = getLayersForPixel(pixelIndex);
    const pixelColor = getPixelColor(pixelData);
    state.pixels.push(pixelColor);
  })
};

const printImage = () => {
  for (let y = 0; y < HEIGHT; y++) {
    const line = []
    for (let x = 0; x < WIDTH; x++) {
      const coordinate = (y * WIDTH) + x;
      const pixel = state.pixels[coordinate];
      line.push(pixel === 0 ? '-' : '#');
    }
    console.log(line.join(''));
  }
};

const run = () => {
  parseInput();
  splitIntoLayers();
  calculatePixelValues();
  printImage();
};

run();

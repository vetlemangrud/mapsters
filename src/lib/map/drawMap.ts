import { generateTerrainFunction, HEIGHT, WIDTH } from "$lib/terraingen";

type color = { r: number; g: number; b: number };
const color = (r: number, g: number, b: number) => ({ r, g, b });

const interpolateColors = (
  c1: color,
  c2: color,
  start: number,
  end: number,
  current: number
) => ({
  r: c1.r + ((c2.r - c1.r) * (current - start)) / (end - start),

  g: c1.g + ((c2.g - c1.g) * (current - start)) / (end - start),
  b: c1.b + ((c2.b - c1.b) * (current - start)) / (end - start),
});

const BOTTOMCOLOR: color = { r: 172, g: 195, b: 166 };
const TOPCOLOR: color = { r: 242, g: 230, b: 227 };
export const drawMap = (
  planetName: string,
  ctx: CanvasRenderingContext2D,
  imageWidth: number,
  imageHeight: number
) => {
  const terrainFunction = generateTerrainFunction(planetName);
  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const pixel_height = terrainFunction(
        (x * WIDTH) / imageWidth,
        (y * HEIGHT) / imageHeight
      );
      const pixelColor = interpolateColors(
        BOTTOMCOLOR,
        TOPCOLOR,
        0,
        50,
        pixel_height
      );

      ctx.fillStyle = `rgb(${pixelColor.r},${pixelColor.g},${pixelColor.b})`;

      ctx.fillRect(x, y, 1, 1);
    }
  }
  drawContourLines(planetName, ctx, imageWidth, imageHeight);
};

const quantize = (value: number, delta: number) =>
  Math.floor(value / delta) * delta;

const drawContourLines = (
  planetName: string,
  ctx: CanvasRenderingContext2D,
  imageWidth: number,
  imageHeight: number,
  contourInterval: number = 5
) => {
  ctx.fillStyle = `#553333`;
  const terrainFunction = generateTerrainFunction(planetName);
  // Get heights of each pixel, quantized to contourInterval (so 0, 10, 20, etc.)
  // Use high pass filter with threshold to draw edges
  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      //Get Quantized Pixel
      const getQP = (x: number, y: number) =>
        quantize(
          terrainFunction((x * WIDTH) / imageWidth, (y * HEIGHT) / imageHeight),
          contourInterval
        );
      const highPassRes =
        1 * getQP(x, y) -
        (1 / 4) *
          (getQP(x - 1, y) +
            getQP(x, y - 1) +
            getQP(x + 1, y) +
            getQP(x, y + 1));
      if (highPassRes > 1) {
        ctx.fillRect(x, y, 1, 1);
      }
    }
  }
  // Use dilation to thicken lines
};

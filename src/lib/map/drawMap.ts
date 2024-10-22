import { generateTerrainFunction, HEIGHT, WIDTH } from "$lib/terraingen";

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

      ctx.fillStyle = `rgb(${pixel_height},${pixel_height},${pixel_height})`;

      ctx.fillRect(x, y, 1, 1);
    }
  }
};

const drawContourLines = (
  planetName: string,
  ctx: CanvasRenderingContext2D,
  imageWidth: number,
  imageHeight: number,
  contourInterval: number = 10
) => {
  const terrainFunction = generateTerrainFunction(planetName);
  // Get heights of each pixel, quantized to contourInterval (so 0, 10, 20, etc.)
  // Use high pass filter with threshold to draw edges
  const image = new Array(imageHeight)
    .fill(0)
    .map(() => new Array(imageWidth).fill(0));
  for (let y = 0; y < imageHeight; y++) {
    for (let x = 0; x < imageWidth; x++) {
      const pixel_height = terrainFunction(
        (x * WIDTH) / imageWidth,
        (y * HEIGHT) / imageHeight
      );
    }
  }
  // Use dilation to thicken lines
};

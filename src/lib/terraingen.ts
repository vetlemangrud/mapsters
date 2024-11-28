// import the noise functions you need
import { mkSimplexNoise, type PRNG } from "@spissvinkel/simplex-noise";
import Chance from "chance";

export const WIDTH = 200;
export const HEIGHT = 200;
const MAX_HEIGHT = 40;
const SIMPLEX_DELTA = 0.01; // More delta = less smooth

export const generateTerrainFunction = (seed: string) => {
  const chance = new Chance(seed);
  const basicRandom: PRNG = () => chance.floating({ min: 0, max: 1 });
  const noiseGenerator = mkSimplexNoise(basicRandom);
  return (x: number, y: number) => {
    return (
      (MAX_HEIGHT / 2) *
      (noiseGenerator.noise2D(x * SIMPLEX_DELTA, y * SIMPLEX_DELTA) + 1)
    );
  };
};

export const SHAPE_IMAGES = ["/1.png", "/2.png", "/3.png", "/4.png", "/5.png"];
export const SHAPES: Promise<HTMLImageElement>[] = SHAPE_IMAGES.map(
  (n) =>
    new Promise((resolve, reject) => {
      let img = new Image();
      img.onload = () => resolve(img);
      img.onerror = reject;
      img.src = n;
    })
);

export const getShapePositions = (seed: string) => {
  const chance = new Chance(seed);
  const positions = [];
  for (let i = 0; i < SHAPES.length; i++) {
    positions.push({
      x: chance.floating({ min: 10, max: WIDTH - 10 }),
      y: chance.floating({ min: 10, max: HEIGHT - 10 }),
    });
  }
  return positions;
};

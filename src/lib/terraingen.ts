// import the noise functions you need
import { mkSimplexNoise, type PRNG } from "@spissvinkel/simplex-noise";
import Chance from "chance";

export const WIDTH = 200;
export const HEIGHT = 200;
const MAX_HEIGHT = 50;
const SIMPLEX_DELTA = 0.02; // More delta = less smooth

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

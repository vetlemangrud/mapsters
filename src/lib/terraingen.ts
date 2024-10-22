// import the noise functions you need
import { mkSimplexNoise, type PRNG } from "@spissvinkel/simplex-noise";
import Chance from "chance";

const generateTerrain = (seed: string) => {
  const chance = new Chance(seed);
  const basicRandom: PRNG = () => chance.floating({ min: 0, max: 1 });
  const noiseGenerator = mkSimplexNoise(basicRandom);
};

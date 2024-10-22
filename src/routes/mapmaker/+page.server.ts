import { redirect } from "@sveltejs/kit";
import { Chance } from "chance";

export function load({ url }) {
  let planet = url.searchParams.get("planet");

  if (!planet) {
    const chance = Chance();
    const planetName = chance.word({ syllables: 3 });
    redirect(302, "/mapmaker?planet=" + planetName);
  }
  if (planet != planet.toLowerCase()) {
    redirect(302, "/mapmaker?planet=" + planet.toLowerCase());
  }
}

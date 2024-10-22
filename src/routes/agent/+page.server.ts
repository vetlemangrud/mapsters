import { redirect } from "@sveltejs/kit";

export function load({ url }) {
  let planet = url.searchParams.get("planet");
  if (!planet) {
    redirect(302, "/");
  }
  if (planet != planet.toLowerCase()) {
    redirect(302, "/agent?planet=" + planet.toLowerCase());
  }
}

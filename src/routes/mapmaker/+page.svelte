<script lang="ts">
  import { page } from "$app/stores";
  import { drawMap } from "$lib/map/drawMap";
  import { generateTerrainFunction } from "$lib/terraingen";
  import { onMount } from "svelte";
  const planet = $page.url.searchParams.get("planet") ?? "";
  let canvas: HTMLCanvasElement;
  onMount(() => {
    const ctx = canvas.getContext("2d");
    if (ctx) drawMap(planet, ctx, 1000, 1000);
  });
</script>

<h1>Map for planet {planet[0].toUpperCase() + planet.slice(1)}</h1>
<canvas id="map" bind:this={canvas} width="1000" height="1000"></canvas>

<script lang="ts">
  import { page } from "$app/stores";
  import { initTeleportExample } from "$lib/threejs/teleportexample";
  import { onMount } from "svelte";
  let parent: HTMLDivElement;
  const planet = $page.url.searchParams.get("planet") ?? "";
  onMount(() => {
    initTeleportExample(parent, planet);
  });
</script>

<div bind:this={parent}></div>

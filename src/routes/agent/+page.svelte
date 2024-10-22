<script lang="ts">
  import { initTeleportExample } from "$lib/threejs/teleportexample";
  import { onMount } from "svelte";
  let parent: HTMLDivElement;
  onMount(() => {
    initTeleportExample(parent);
  });
</script>

<div bind:this={parent}></div>

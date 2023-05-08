<script lang="ts">
  import type { PageData } from './$types'
  import Commit from '$lib/Commit.svelte'

  export let data: PageData
</script>

<main>
  {#await data.commits then commits}
    {#each commits as commit}
      <Commit {commit} />
      <hr />
    {/each}
  {/await}
</main>

<style>
  hr {
    background-color: var(--color-accents-6);
    border: none;
    height: 1px;
    width: 60%;
  }
</style>
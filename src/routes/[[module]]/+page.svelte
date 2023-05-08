<script lang="ts">
  import type { PageData } from './$types'
  import Commit from '$lib/Commit.svelte'
  import { page } from '$app/stores'

  export let data: PageData
</script>

<svelte:head>
	<title>{$page.params.module ? `${$page.params.module} | ` : ''}Unreal Tracker</title>
</svelte:head>

<main>
  {#each data.commits as commit}
    <Commit {commit} />
    <hr />
  {/each}
</main>

<style>
  hr {
    background-color: var(--color-accents-6);
    border: none;
    height: 1px;
    width: 60%;
  }
</style>
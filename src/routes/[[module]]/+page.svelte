<script lang="ts">
  import type { PageData } from './$types'
  import Commit from '$lib/Commit.svelte'

  export let data: PageData
</script>

<main>
  {#each data.commits as commit}
    <Commit {commit} />
  {/each}
</main>


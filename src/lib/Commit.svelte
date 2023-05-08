<script lang="ts">
  import type { Commit } from '$lib/types'
  export let commit: Commit
</script>

<section>
  <div>
    <h3>{commit.modules}</h3>
    <time>{commit.date}</time>
  </div>
  <p>{@html commit.message}</p>
  <a href={`https://github.com/EpicGames/UnrealEngine/commit/${commit.sha}`}>
    {commit.sha.slice(0, 7)}
  </a>
</section>

<style>
  p {
    white-space: pre-wrap;
  }
</style>
<script lang="ts">
  import type { Commit } from '$lib/types'
  export let commit: Commit
</script>

<section>
  <div class="section-header">
    <div class="module">
      {#each commit.modules.split(',') as module }
        <span>{module}</span>
      {/each}
    </div>
    <a href={`https://github.com/EpicGames/UnrealEngine/commit/${commit.sha}`}>
      {`${commit.date} · ${commit.sha.slice(0, 7)}`}
    </a>
  </div>

  <p>{@html commit.message}</p>
</section>

<style>
  p {
    white-space: pre-wrap;
  }

  section {
    margin-top: var(--block-spacing-vertical);
    margin-bottom: var(--block-spacing-vertical);
  }

  .section-header {
    display: grid;
    grid-auto-flow: column;
    justify-content: space-between;
    color: var(--color-accents-5);
  }

  .module {
    user-select: none;
  }
</style>
<script lang="ts">
  import { page } from '$app/stores'
  
  export let modules: string[]
</script>

<header>
  <ul>
    <li class:active={!$page.params.module}>
      <a href="/">All</a>
    </li>

    {#each modules as module}
      <li class:active={$page.params.module === module}>
        <a href="/{encodeURIComponent(module)}">{module}</a>
      </li>
    {/each}
  </ul>
</header>

<style>
  li {
    display: inline-block;
    margin-right: var(--spacing);
  }

  li a {
    color: var(--color-accents-4);
  }

  li.active a {
    color: var(--color-accents-1);
  }
</style>
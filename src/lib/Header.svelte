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
  li.active {
    color: red;
  }
</style>
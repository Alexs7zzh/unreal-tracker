<script lang="ts">
  import "./style.css"
  import Header from '$lib/Header.svelte'
  import type { LayoutData } from './$types';

  export let data: LayoutData
</script>

<Header modules={data.modules} />
<hr />
<slot></slot>

<style>
  :global(body) {
    max-width: 720px;
    margin: 0 auto;
    padding: var(--spacing);
  }

  hr {
    margin-top: var(--block-spacing-vertical);
    margin-bottom: var(--block-spacing-vertical);
    background-color: var(--color-accents-6);
    border: none;
    height: 1px;
  }
</style>
<script lang="ts">
  import Header from '$lib/Header.svelte'
  import type { LayoutData } from './$types';

  export let data: LayoutData
</script>

<Header modules={data.modules} />
<slot></slot>
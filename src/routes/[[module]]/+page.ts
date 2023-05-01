import type { PageLoad } from "./$types"
import type { Commit } from '$lib/types'

export const load: PageLoad = async event => {
  let url = `${event.url.origin}/api/commits`

  if (event.params.module) {
    const searchParams = new URLSearchParams();
    searchParams.append('module', event.params.module)
    url += `?${searchParams.toString()}`
  }

  const commits = await(await fetch(url)).json() as Commit[]

  return { commits }
}
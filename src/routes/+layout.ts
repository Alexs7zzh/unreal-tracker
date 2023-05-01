import type { LayoutLoad } from "./$types"

export const load: LayoutLoad = async event => {
  const modules = await (await fetch(`${event.url.origin}/api/modules`)).json() as string[]

  return { modules }
}
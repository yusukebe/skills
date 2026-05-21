import { Hono, type Context } from 'hono'
import { buildLanding, buildStart } from './landing'
import { getSkill, getSkillBody, listSkills } from './skills'

const app = new Hono<{ Bindings: Env }>()

const MARKDOWN = 'text/markdown; charset=utf-8'

// `wrangler dev` rewrites `c.req.url` to the route's custom domain, so we
// derive the public origin from the actual Host header instead.
function getOrigin(c: Context): string {
  const url = new URL(c.req.url)
  const host = c.req.header('host') ?? url.host
  return `${url.protocol}//${host}`
}

app.get('/', (c) => {
  const origin = getOrigin(c)
  return c.body(buildLanding(origin), 200, { 'content-type': MARKDOWN })
})

app.get('/start.md', (c) => {
  const origin = getOrigin(c)
  return c.body(buildStart(origin), 200, { 'content-type': MARKDOWN })
})

app.get('/skills.json', (c) => {
  const origin = getOrigin(c)
  return c.json({
    skills: listSkills().map((s) => ({
      ...s,
      url: `${origin}/skills/${s.name}.md`,
    })),
  })
})

app.get('/skills/:file', async (c) => {
  const file = c.req.param('file')
  let name: string
  let isJson = false
  if (file.endsWith('.json')) {
    name = file.slice(0, -'.json'.length)
    isJson = true
  } else if (file.endsWith('.md')) {
    name = file.slice(0, -'.md'.length)
  } else {
    return c.notFound()
  }
  const skill = getSkill(name)
  if (!skill) {
    return c.notFound()
  }
  if (isJson) {
    const origin = getOrigin(c)
    const body = await getSkillBody(c.env.ASSETS, c.req.url, name)
    return c.json({
      ...skill,
      url: `${origin}/skills/${skill.name}.md`,
      body,
    })
  }
  const res = await c.env.ASSETS.fetch(new URL(`/${name}/SKILL.md`, c.req.url))
  return new Response(res.body, {
    status: res.status,
    headers: { 'content-type': MARKDOWN },
  })
})

export default app

import { Hono, type Context } from 'hono'
import { buildLanding, buildStart } from './landing'
import { getSkill, listSkills } from './skills'

const app = new Hono<{ Bindings: Env }>()

const MARKDOWN = 'text/markdown; charset=utf-8'

// Use the actual request Host header rather than `c.req.url`. `wrangler dev`
// rewrites `c.req.url` to the configured custom domain (skills.yusuke.run),
// so without this, local requests would also show production URLs in the
// rendered Markdown.
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
  const index = listSkills().map((s) => ({
    id: s.id,
    title: s.title,
    summary: s.summary,
    tags: s.tags,
    references: s.references,
    related: s.related,
    url: `${origin}/skills/${s.id}`,
  }))
  return c.json({ skills: index })
})

app.get('/skills/:file', async (c) => {
  const file = c.req.param('file')
  const isJson = file.endsWith('.json')
  const id = isJson ? file.slice(0, -'.json'.length) : file
  const skill = getSkill(id)
  if (!skill) {
    return c.notFound()
  }
  if (isJson) {
    const origin = getOrigin(c)
    return c.json({
      id: skill.id,
      title: skill.title,
      summary: skill.summary,
      tags: skill.tags,
      references: skill.references,
      related: skill.related,
      url: `${origin}/skills/${skill.id}`,
      body: skill.body,
    })
  }
  const assetUrl = new URL(`/${id}.md`, c.req.url)
  const res = await c.env.ASSETS.fetch(assetUrl)
  return new Response(res.body, {
    status: res.status,
    headers: { 'content-type': MARKDOWN },
  })
})

export default app

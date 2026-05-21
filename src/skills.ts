import { parseSkill, type Frontmatter } from './frontmatter'
import honoSource from '../skills/hono.md'
import honoInertiaSource from '../skills/hono-inertia.md'
import cloudflareSource from '../skills/cloudflare.md'
import rjSource from '../skills/rj.md'

export type Skill = {
  id: string
  title: string
  summary: string
  tags: string[]
  references: string[]
  related: string[]
  body: string
  source: string
}

// The registry is explicit on purpose: every skill must be imported and
// listed here so the bundle is deterministic and the type checker can see
// the full set. To add a skill, create skills/<id>.md and add a line below.
const sources: Record<string, string> = {
  cloudflare: cloudflareSource,
  hono: honoSource,
  'hono-inertia': honoInertiaSource,
  rj: rjSource,
}

function build(): Record<string, Skill> {
  const out: Record<string, Skill> = {}
  for (const [id, source] of Object.entries(sources)) {
    const { frontmatter, body } = parseSkill(source)
    if (frontmatter.id !== id) {
      throw new Error(`skill "${id}" frontmatter id is "${frontmatter.id}"`)
    }
    out[id] = toSkill(frontmatter, body, source)
  }
  return out
}

function toSkill(fm: Frontmatter, body: string, source: string): Skill {
  return {
    id: fm.id,
    title: fm.title,
    summary: fm.summary,
    tags: fm.tags,
    references: fm.references,
    related: fm.related,
    body,
    source,
  }
}

export const skills: Record<string, Skill> = build()

export function listSkills(): Skill[] {
  return Object.values(skills).sort((a, b) => a.id.localeCompare(b.id))
}

export function getSkill(id: string): Skill | undefined {
  return skills[id]
}

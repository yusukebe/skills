import type { Frontmatter } from './frontmatter'
import { manifest } from './registry.generated'

export type Skill = Frontmatter

export function listSkills(): Skill[] {
  return [...manifest].sort((a, b) => a.id.localeCompare(b.id))
}

export function getSkill(id: string): Skill | undefined {
  return manifest.find((s) => s.id === id)
}

export async function getSkillBody(
  assets: Fetcher,
  baseUrl: string,
  id: string
): Promise<string | undefined> {
  const res = await assets.fetch(new URL(`/${id}.md`, baseUrl))
  if (!res.ok) return undefined
  return await res.text()
}

import type { Frontmatter } from './frontmatter'
import { manifest } from './registry.generated'

export type Skill = Frontmatter

export function listSkills(): Skill[] {
  return [...manifest].sort((a, b) => a.name.localeCompare(b.name))
}

export function getSkill(name: string): Skill | undefined {
  return manifest.find((s) => s.name === name)
}

export async function getSkillBody(
  assets: Fetcher,
  baseUrl: string,
  name: string
): Promise<string | undefined> {
  const res = await assets.fetch(new URL(`/${name}/SKILL.md`, baseUrl))
  if (!res.ok) return undefined
  return await res.text()
}

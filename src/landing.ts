import landingTemplate from './landing.template.md'
import startTemplate from './start.template.md'
import { listSkills, type Skill } from './skills'

const ORIGIN = 'https://skills.yusuke.run'

export function buildLanding(origin: string = ORIGIN): string {
  return landingTemplate.replaceAll('{{origin}}', origin)
}

export function buildStart(origin: string = ORIGIN): string {
  const skills = listSkills()
    .map((s) => renderSkill(s, origin))
    .join('\n\n')
  return startTemplate.replaceAll('{{origin}}', origin).replaceAll('{{skills}}', skills)
}

function renderSkill(skill: Skill, origin: string): string {
  return `- [\`${skill.name}\`](${origin}/skills/${skill.name}.md) — ${skill.description}`
}

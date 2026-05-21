// Minimal YAML-frontmatter parser. We control the input shape (see AGENTS.md
// for the schema), so this only handles what we actually use: scalars, flow
// lists like `[a, b, c]`, and block lists with `- item` indented under a key.

export type Frontmatter = {
  name: string
  title: string
  description: string
  tags: string[]
  references: string[]
  related: string[]
}

export type ParsedSkill = {
  frontmatter: Frontmatter
  body: string
}

export function parseSkill(source: string): ParsedSkill {
  const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/)
  if (!match) {
    throw new Error('skill is missing frontmatter')
  }
  const [, yaml, body] = match
  const fm = parseFrontmatter(yaml)
  return { frontmatter: fm, body: body.replace(/^\s+/, '') }
}

function parseFrontmatter(yaml: string): Frontmatter {
  const lines = yaml.split(/\r?\n/)
  const data: Record<string, string | string[]> = {}

  let currentListKey: string | null = null
  let currentList: string[] = []

  const flushList = () => {
    if (currentListKey) {
      data[currentListKey] = currentList
      currentListKey = null
      currentList = []
    }
  }

  for (const raw of lines) {
    if (raw.trim() === '') continue

    const listItem = raw.match(/^\s+-\s+(.*)$/)
    if (listItem && currentListKey) {
      currentList.push(stripQuotes(listItem[1].trim()))
      continue
    }

    flushList()

    const kv = raw.match(/^([A-Za-z_][\w-]*):\s*(.*)$/)
    if (!kv) continue
    const [, key, rest] = kv
    const value = rest.trim()

    if (value === '') {
      // block list follows
      currentListKey = key
      currentList = []
      continue
    }

    if (value.startsWith('[') && value.endsWith(']')) {
      const inner = value.slice(1, -1).trim()
      data[key] = inner === '' ? [] : inner.split(',').map((s) => stripQuotes(s.trim()))
      continue
    }

    data[key] = stripQuotes(value)
  }

  flushList()

  return {
    name: String(data.name ?? ''),
    title: String(data.title ?? ''),
    description: String(data.description ?? ''),
    tags: asArray(data.tags),
    references: asArray(data.references),
    related: asArray(data.related),
  }
}

function stripQuotes(s: string): string {
  if ((s.startsWith('"') && s.endsWith('"')) || (s.startsWith("'") && s.endsWith("'"))) {
    return s.slice(1, -1)
  }
  return s
}

function asArray(v: unknown): string[] {
  if (Array.isArray(v)) return v
  if (typeof v === 'string' && v.length > 0) return [v]
  return []
}

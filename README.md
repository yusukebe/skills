# skills.yusuke.run

A personal, curated collection of **skills** — small, focused Markdown documents that describe how to do specific things with specific tools. Designed to be consumed by coding agents (Claude Code, Cursor, etc.) and by humans.

Deployed at <https://skills.yusuke.run>.

## What is a "skill"?

A skill is a single Markdown file that answers a focused question like:

- "How do I build a server-rendered UI with Hono?"
- "How do I combine Inertia.js with Hono?"
- "How do I structure a Cloudflare Workers project with D1?"

Each skill is small, opinionated (it reflects how _I_ like to do it), and includes links to the canonical human-facing documentation so an agent can drill deeper when needed.

## How agents should use this

The whole site is designed so an agent only needs **one** instruction:

> Fetch <https://skills.yusuke.run> to start a project.

The root response is a Markdown document that tells the agent what this site is, lists every available skill with its URL, and explains how to drill down. From there the agent fetches the individual skills it needs.

## URL shape

- `GET /` — agent entry point. Markdown: usage instructions + full skill index.
- `GET /skills/:id` — a single skill (Markdown).
- `GET /skills.json` — machine-readable index (id, title, summary, tags).

All content is served as `text/markdown; charset=utf-8` unless otherwise noted.

## Repository layout

```text
.
├── AGENTS.md          # Instructions for AI agents working in this repo
├── README.md          # This file
├── skills/            # The skill Markdown files (flat — one file per skill)
│   └── *.md
├── src/
│   ├── index.ts            # Hono routes
│   ├── landing.ts          # Renders the agent-facing root Markdown
│   ├── landing.template.md # Static prose for the root page (with placeholders)
│   └── skills.ts           # Skill registry (imports every skill Markdown)
└── wrangler.jsonc
```

## Adding a new skill

See [AGENTS.md](./AGENTS.md) for the full contribution procedure. The short version:

1. Create `skills/<id>.md` with the frontmatter shown in AGENTS.md.
2. Register it in `src/skills.ts`.
3. `bun run dev` to preview, `bun run deploy` to publish.

## Develop

```sh
bun install
bun run dev      # local preview
bun run deploy   # deploy to skills.yusuke.run
```

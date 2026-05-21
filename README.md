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

The site is designed so an agent only needs **one** instruction. The landing page (`/`) shows a copy-pasteable prompt:

> `fetch https://skills.yusuke.run/start.md to start a new project`

Paste that into your coding agent at the start of a new project. From `/start.md` the agent discovers every available skill and drills down into the ones it needs.

## URL shape

- `GET /` — human-facing landing with the copy-pasteable agent prompt.
- `GET /start.md` — agent entry point. Markdown: usage instructions + skill index.
- `GET /skills/:id` — a single skill (Markdown).
- `GET /skills/:id.json` — the same skill as JSON (frontmatter + body).
- `GET /skills.json` — machine-readable full index (id, title, summary, tags, references, related).

All Markdown content is served as `text/markdown; charset=utf-8`.

## Repository layout

```text
.
├── AGENTS.md                # Instructions for AI agents working in this repo
├── README.md                # This file
├── skills/                  # The skill Markdown files (flat — one file per skill)
│   └── *.md
├── scripts/
│   └── build-registry.ts    # Scans skills/*.md, writes src/registry.generated.ts
├── src/
│   ├── index.ts             # Hono routes
│   ├── landing.ts           # Renders the / and /start.md responses
│   ├── landing.template.md  # Template for /
│   ├── start.template.md    # Template for /start.md (with {{skills}} placeholder)
│   ├── frontmatter.ts       # Minimal YAML frontmatter parser
│   ├── registry.generated.ts # Build output — frontmatter for every skill (gitignored)
│   └── skills.ts            # Reads the generated registry, fetches bodies via env.ASSETS
└── wrangler.jsonc
```

## Adding a new skill

See [AGENTS.md](./AGENTS.md) for the full contribution procedure. The short version:

1. Create `skills/<id>.md` with the frontmatter shown in AGENTS.md.
2. `bun run dev` to preview (the registry is regenerated automatically from `skills/*.md`).
3. Push to `main` — Cloudflare Workers Builds handles the deploy.

From another working project, an agent can also open a PR for you — see the [`contribute`](https://skills.yusuke.run/skills/contribute) skill.

## Develop

```sh
bun install
bun run dev      # local preview at http://localhost:8787
```

## Deploy

Deployment is automated via **Cloudflare Workers Builds**. Any push to `main` builds and deploys the Worker.

Initial setup (one-time, in the Cloudflare dashboard):

1. **Workers & Pages** → the `skills` Worker → **Settings** → **Builds**.
2. **Connect** the GitHub repository `yusukebe/skills`.
3. **Branch:** `main`.
4. **Build command:** leave empty (or `bun install`).
5. **Deploy command:** `bun run deploy`.

`bun run deploy` regenerates `src/registry.generated.ts` from the current `skills/*.md` and then runs `wrangler deploy`. The build step is bundled into the `deploy` script so a manual local deploy can't forget it either.

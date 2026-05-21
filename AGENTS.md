# AGENTS.md

Instructions for AI agents working **inside this repository**.

If you are an agent that landed here trying to discover skills for _some other project_, you are in the wrong place — fetch <https://skills.yusuke.run> instead. This file is for agents modifying this repo: adding a new skill, editing the Worker, etc.

## What this project is

This repo is the source for <https://skills.yusuke.run>, a curated Markdown skill catalog. Its design goal is that a coding agent working on any project can be given a single instruction — "fetch <https://skills.yusuke.run> to start a project" — and from there discover and read the skills it needs.

The whole site is itself a small Hono app deployed to Cloudflare Workers. So when editing this project, _the project's own catalog applies to it_: fetch `/skills/hono` and `/skills/cloudflare` (or read the upstream collections those skills point to — `yusukebe/hono-skill` and `cloudflare/skills`) before changing the Worker or its config.

## Skill philosophy

Each skill is **a curated pointer into the open web**, not a reimplementation of documentation.

- If a topic already has a good external resource (official docs, a dedicated `*/skills` repo, a canonical blog post), the skill links to it and adds only the opinionated framing — when to reach for this tool, when not to, the defaults I use.
- If a topic has _no_ widely available guide (e.g. an unusual combination of tools), the skill writes the guidance out in full.
- The `npx skills add <pkg>` installer is one way for some agents to ingest external collections, but it is not required. Direct fetching of the linked files is always acceptable.

## Architecture

- **Skill files** — `skills/<id>.md`, each with frontmatter (see below).
- **Static Assets** — `skills/` is bound to the Worker as `env.ASSETS` (see `wrangler.jsonc`). Individual skill bodies are served directly from the Cloudflare edge via `env.ASSETS.fetch(...)`. `run_worker_first: true` keeps assets reachable only via the Worker, so the canonical URL is `/skills/<id>` and the underlying `.md` file is not directly exposed.
- **Bundled index** — the wrangler `Text` rule also imports every `*.md` into the bundle, so `src/skills.ts` can build a typed registry of frontmatter at build time. The index page (`GET /`) and `GET /skills.json` are generated from that registry.
- **Landing template** — the static prose of the agent entry document lives in `src/landing.template.md`, with `{{origin}}` and `{{skills}}` placeholders. `src/landing.ts` reads the template (also via the Text rule), renders each skill as a Markdown block, and substitutes the placeholders. Edit `landing.template.md` for wording changes; edit `landing.ts` only for structural changes to how skills are rendered.
- **Routes**:
  - `GET /` — agent entry point, Markdown. Built dynamically by `src/landing.ts`.
  - `GET /skills/:id` — a single skill, Markdown. Served from `env.ASSETS`.
  - `GET /skills.json` — machine-readable index.

## Frontmatter schema

```markdown
---
id: hono-jsx
title: Build UIs with Hono JSX
summary: One-line description shown in the root index.
tags: [hono, ui, jsx]
references:
  - https://hono.dev/docs/guides/jsx
  - https://github.com/yusukebe/hono-skill
related: [hono, hono-inertia]
---
```

Rules:

- `id` must match the filename (`skills/<id>.md`) and the URL segment.
- `title` is a short sentence — what the skill teaches.
- `summary` is one short line; it is what the root index shows.
- `tags` are flat, lowercase, kebab-case keywords.
- `references` lists URLs the agent should follow for depth: official docs, GitHub repos, canonical articles. Always include at least one if the topic has any web presence.
- `related` lists other skill ids in this catalog that an agent should probably also read.

## Adding a new skill

1. Pick a short, descriptive **id** in `kebab-case`. The id appears in the URL, so keep it stable. Examples: `hono`, `hono-inertia`, `cloudflare`.
2. Create `skills/<id>.md` with the frontmatter above and a body that follows the philosophy section.
3. Register the file in `src/skills.ts` by adding an import and a registry entry. This is explicit on purpose — the bundle stays deterministic and the type checker knows every id.
4. `bun run dev` and verify:
   - `curl http://localhost:8787/` shows the skill in the index.
   - `curl http://localhost:8787/skills/<id>` returns the raw Markdown.
5. `bun run deploy` to publish.

## Editing the Worker

- Keep it boring. Plain Hono on Cloudflare Workers. No middleware unless it is unavoidable.
- The root document (`GET /`) is generated at request time from the registry. Do not check in a snapshot of it.
- Static Assets are configured with `run_worker_first: true`. If you change that, also re-check that `/skills/<id>` is the only URL that exposes skill content (no `/<id>.md` leak).
- After changing `wrangler.jsonc` bindings, re-run `bun run cf-typegen` so `Env` stays in sync.

## Conventions

- All documentation in this repo (README, AGENTS, skill files) is written in **English**.
- Do **not** hard-wrap Markdown prose. One paragraph per source line.
- Do not add emojis unless explicitly requested.
- Commits should describe _why_, not _what_ — the diff already shows the what.

## Formatting

Source code follows Hono's own Prettier config (see `.prettierrc`):

- `printWidth: 100`
- `semi: false`
- `singleQuote: true`
- `trailingComma: "es5"`
- `tabWidth: 2`
- `endOfLine: "lf"`
- `jsxSingleQuote: true`

Prettier itself is intentionally **not** in `package.json`. Apply the rules by hand when writing or editing code — match the style manually, or run Prettier via your editor / a one-off `bunx prettier`. Do **not** add Prettier as a project dependency unless the user explicitly asks for it.

## Vercel `skills` compatibility (planned)

A future endpoint may expose this catalog in whatever format Vercel's `skills` CLI expects. Until that shape is pinned down, the canonical interface is `GET /` (Markdown) and `GET /skills.json` (JSON index).

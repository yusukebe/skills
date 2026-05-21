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

- **Skill files** — `skills/<name>/SKILL.md`, each with frontmatter (see below). This layout matches the `vercel-labs/skills` CLI, so `npx skills add yusukebe/skills` installs the catalog into other tools (Claude Code, Cursor, etc.).
- **Static Assets** — `skills/` is bound to the Worker as `env.ASSETS` (see `wrangler.jsonc`). Skill bodies are served from the Cloudflare edge through `env.ASSETS.fetch('/<name>/SKILL.md')`. `run_worker_first: true` keeps assets reachable only via the Worker, so the canonical URL is `/skills/<name>` (the underlying `SKILL.md` is not directly exposed).
- **Build-time registry** — `scripts/build-registry.ts` scans `skills/*/SKILL.md`, parses the frontmatter of each, and writes `src/registry.generated.ts` before every `dev` or `deploy`. The generated module exports a typed `Frontmatter[]` that the Worker imports at build time — no runtime manifest fetch needed. `src/registry.generated.ts` is gitignored — it is regenerated on every build.
- **Runtime read path** — `src/skills.ts` reads the registry directly from the bundled module (synchronous, zero I/O). Individual skill _bodies_ are fetched on demand via `env.ASSETS.fetch('/<name>/SKILL.md')`. The Worker bundle contains no Markdown bodies — only frontmatter (via the generated registry) and the two small landing templates under `src/`.
- **Templates** — two Markdown files under `src/` drive the agent-facing pages:
  - `src/landing.template.md` — copy-pasteable prompt shown at `/`. Has only `{{origin}}` placeholder.
  - `src/start.template.md` — the agent entry document served at `/start.md`. Has `{{origin}}` and `{{skills}}` placeholders. `src/landing.ts` reads both via the wrangler `Text` rule (which matches `**/*.md`), renders each skill row as Markdown, and substitutes the placeholders. Edit these templates for wording changes; edit `landing.ts` only for structural changes to how skills are rendered.
- **Routes**:
  - `GET /` — human landing with the copy-pasteable agent prompt.
  - `GET /start.md` — agent entry point: usage instructions + skill index.
  - `GET /skills/:name` — a single skill, Markdown. Served from `env.ASSETS`.
  - `GET /skills/:name.json` — the same skill as JSON (frontmatter + body).
  - `GET /skills.json` — machine-readable full index (manifest + URLs).

## Frontmatter schema

```markdown
---
name: hono-jsx
title: Build UIs with Hono JSX
description: One-line description shown in the root index and consumed by `npx skills add`.
tags: [hono, ui, jsx]
references:
  - https://hono.dev/docs/guides/jsx
  - https://github.com/yusukebe/hono-skill
related: [hono, hono-inertia]
---
```

Rules:

- `name` must match the directory (`skills/<name>/`) and the URL segment. This is the field `npx skills add` reads.
- `description` is one short line — it is what the root index shows, and what the `skills` CLI surfaces when listing.
- `title` is a longer sentence — what the skill teaches. Optional; the CLI ignores it but the local index displays it.
- `tags`, `references`, `related` are extra metadata for this site only; the `skills` CLI ignores them.

## Adding a new skill

1. Pick a short, descriptive **name** in `kebab-case`. The name appears in the URL and is the directory name, so keep it stable. Examples: `hono`, `hono-inertia`, `cloudflare`.
2. Create `skills/<name>/SKILL.md` with the frontmatter above and a body that follows the philosophy section. **No registry edit is needed** — `scripts/build-registry.ts` re-discovers `skills/*/SKILL.md` on every `dev`/`deploy`.
3. `bun run dev` and verify:
   - `curl http://localhost:8787/start.md` shows the skill in the index.
   - `curl http://localhost:8787/skills/<name>` returns the raw Markdown.
4. Commit and push to `main`. Cloudflare Workers Builds deploys automatically (see README).

If you want to contribute a skill from a _different_ working project (e.g. an agent in another repo deciding to capture some knowledge), see the [`contribute`](https://skills.yusuke.run/skills/contribute) skill — it documents the PR + auto-merge flow.

## Editing the Worker

- Keep it boring. Plain Hono on Cloudflare Workers. No middleware unless it is unavoidable.
- The root document (`GET /`) is generated at request time from the registry. Do not check in a snapshot of it.
- Static Assets are configured with `run_worker_first: true`. If you change that, also re-check that `/skills/<name>` is the only URL that exposes skill content (no `/<name>/SKILL.md` leak).
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

## `npx skills add` compatibility

The on-disk layout (`skills/<name>/SKILL.md` with `name` + `description` frontmatter) matches what `vercel-labs/skills` expects, so the catalog is directly installable into Claude Code, Cursor, and the other tools that CLI supports:

```sh
npx skills add yusukebe/skills
```

Verify locally before pushing a structural change:

```sh
npx skills add /Users/yusuke/work/skills --list
```

That should list every skill with the description shown in its frontmatter.

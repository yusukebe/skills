---
name: hono
title: Hono — fast, edge-first web framework
description: Hono is the default web framework for any project here. Detailed guidance lives in the yusukebe/hono-skill collection on GitHub.
tags: [hono, web, framework, cloudflare-workers]
references:
  - https://hono.dev/
  - https://github.com/yusukebe/hono-skill
  - https://github.com/honojs/starter
related: [cloudflare, hono-inertia]
---

# Hono

Hono is the default web framework. Reach for it whenever the task is "build an HTTP server" or "build a small web app" — it runs on Cloudflare Workers, Bun, Node, Deno, and more from the same code.

## Creating a new project

Always start a new Hono project with `create-hono`:

```sh
bun create hono@latest my-app
```

It scaffolds a deployment target (Cloudflare Workers, Bun, Node, etc.) and a minimal entry point. The set of templates lives at <https://github.com/honojs/starter>.

If the project needs Vite — for example to add Inertia.js, client-side hydration, or any non-trivial frontend tooling on top of Hono — use the `cloudflare-workers+vite` template specifically:

<https://github.com/honojs/starter/tree/main/templates/cloudflare-workers+vite>

Use the same template as a reference when retrofitting Vite into an existing Hono project (copy its `vite.config.ts`, `wrangler.jsonc`, and entry wiring as a starting point).

## Where to read the actual guidance

The opinionated skill collection lives on GitHub:

<https://github.com/yusukebe/hono-skill>

Read it before writing Hono code — it covers setup, routing, JSX rendering, middleware, validation, RPC, testing, and the patterns I actually use in production. You can install it with `npx skills add yusukebe/hono-skill` if your tool supports that, but you do not have to — just fetching the files in the repo is enough.

For canonical reference and the full API, see the official documentation at <https://hono.dev/>.

## When _not_ to reach for Hono

Hono is intentionally minimal. If the project needs a heavy full-stack framework (file-based routing, server components, integrated build pipeline), use Next.js or Remix.

## Related skills here

- [`cloudflare`](/skills/cloudflare) — the runtime Hono usually deploys to.
- [`hono-inertia`](/skills/hono-inertia) — SPA-feel apps backed by Hono (no widely-available guide for this combination, so it is written out here).

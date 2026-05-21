---
name: cloudflare
title: Cloudflare Workers and the rest of the stack
description: Anything Cloudflare (Workers, D1, R2, KV, Durable Objects, Queues). Detailed guidance lives in the official cloudflare/skills collection.
tags: [cloudflare, workers, d1, r2, kv, durable-objects]
references:
  - https://developers.cloudflare.com/workers/
  - https://github.com/cloudflare/skills
related: [hono]
---

# Cloudflare

For anything on Cloudflare — Workers, D1, R2, KV, Durable Objects, Queues, Pages, Vectorize — use the official Cloudflare skill collection:

<https://github.com/cloudflare/skills>

Read it before writing Cloudflare-specific code. You can install it with `npx skills add cloudflare/skills` if your tool supports that, but you do not have to — fetching the files directly from the repo is enough.

The canonical human-facing documentation is at <https://developers.cloudflare.com/workers/>.

## Defaults I use

- **`wrangler.jsonc`**, not `wrangler.toml`. JSON-with-comments is friendlier for tooling and easier to template.
- **Bun** as the package manager and dev driver.
- **Custom domains** via `routes` with `custom_domain: true`, not via Workers Routes.
- **Static Assets** for any file-based content (Markdown, images, generated HTML) when an index does not need to be built from the file contents.

## Related skills here

- [`hono`](/skills/hono) — the web framework I deploy to Workers.

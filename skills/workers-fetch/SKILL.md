---
name: workers-fetch
title: workers-fetch — test a Cloudflare Worker without running a dev server
description: yusukebe/workers-fetch is a curl-like CLI that boots a Worker on demand from its wrangler config and sends a single request. Reach for it instead of `bun run dev` + `curl` when you just want to check one response.
tags: [cli, cloudflare-workers, testing, http]
references:
  - https://github.com/yusukebe/workers-fetch
  - https://developers.cloudflare.com/workers/testing/unstable_startworker/
related: [cloudflare, hono, rj]
---

# workers-fetch

`workers-fetch` is a tiny curl-like CLI that uses Cloudflare's `unstable_startWorker()` to spin up a Worker from its `wrangler.json(c)` / `wrangler.toml`, send a single request, and print the response. Use it when you would otherwise start `bun run dev` in one terminal just to issue one curl in another — `workers-fetch` does both in one shot, then exits.

## Install

```sh
npm install -g workers-fetch
```

## Usage

```sh
# GET / — auto-detects wrangler.jsonc in cwd
workers-fetch

# With a path
workers-fetch /skills/hono

# Other methods, headers, body
workers-fetch -X POST -H 'content-type: application/json' -d '{"a":1}' /api/foo

# Pin a config file
workers-fetch -c wrangler.toml /api/test

# Longer timeout (default 3s)
workers-fetch --timeout 10 /api/slow
```

Output is JSON with `status`, `statusText`, `headers`, and `body` — pipe through `jq` to extract a field:

```sh
workers-fetch /skills.json | jq '.body | fromjson | .skills[].id'
```

## When to reach for it

- One-off response checks during development. No long-running dev server.
- Quick checks of a route or middleware change without context-switching terminals.
- Scripted local smoke tests in a `package.json` script or CI step.

## When `bun run dev` is still better

- Iterating with live reload — `workers-fetch` re-boots the Worker on every invocation.
- Hitting the Worker repeatedly from a browser or another tool that expects a real listening port.

## Related

- [`rj`](/skills/rj) — same idea, but for any HTTP endpoint over the network (not just local Workers).
- [`cloudflare`](/skills/cloudflare) — the runtime this tool drives.

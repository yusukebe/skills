---
name: rj
title: rj — print HTTP response metadata as JSON
description: yusukebe/rj is a tiny CLI that fetches a URL and prints the response metadata (status, headers, protocol, timing) as JSON. It does not print the body — use it alongside `curl`, not as a replacement.
tags: [cli, http, json, debugging]
references:
  - https://github.com/yusukebe/rj
related: []
---

# rj

`rj` is a small CLI for printing the **metadata** of an HTTP response as JSON: status code, headers, protocol, and timing breakdown. It does **not** print the response body — for that, keep using `curl`. The two are complementary: `curl` for the body, `rj` for everything around it.

## Install

```sh
brew install yusukebe/tap/rj
```

Binaries and `go install` are also available — see the repo.

## Usage

```sh
rj https://skills.yusuke.run/skills.json
```

Output looks like:

```json
{
  "code": 200,
  "header": { "content-type": "application/json" },
  "protocol": "HTTP/1.1",
  "status": "200 OK",
  "timing": { "dns_lookup": 0.48, "tcp_connection": 0.21, ... }
}
```

Pipe into `jq` to extract specific fields:

```sh
rj https://skills.yusuke.run/ | jq '.header'
rj https://skills.yusuke.run/ | jq '.code'
```

Common flags:

- `-X POST` — change method.
- `-H 'Header: value'` — add a request header.
- `-u user:pass` — Basic auth.
- `--http3` / `--http1.1` — pin HTTP version.

## When to use

- Confirming response headers (content-type, cache-control, custom `X-*` headers).
- Verifying that an endpoint returns the expected status code.
- Checking how a request is routed (HTTP version, timing breakdown).
- Scripted health checks that need a structured view of the exchange.

For inspecting the response **body**, reach for `curl` (and pipe through `jq` if it's JSON). Use `rj` when the wrapper around the body is what matters.

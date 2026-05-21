---
name: hono-review
title: Review a honojs/hono PR or branch as a maintainer
description: Owner-only. Reviews honojs/hono PRs or local branches with two checks — tests (do they pass, is the approach right) and breaking change (public API, types, hc).
tags: [hono, review, maintenance, owner-only]
references:
  - https://github.com/honojs/hono
  - https://hono.dev/
  - https://github.com/honojs/hono/tree/main/runtime-tests
related: [hono]
---

# Review a honojs/hono PR or branch

Use this skill to **help Yusuke review** a PR or local branch on `honojs/hono` (core repo). The framing is collaborative — the output is material a maintainer skims and then forms their own opinion from, not a verdict handed down. Owner-only: it reflects how Yusuke reviews the core, not a generic PR reviewer.

> **Scope.** `honojs/hono` only. Sibling repos (`middleware`, `honox`, `vite-plugins`, `create-hono`, `node-server`, ...) are not covered — they each have different concerns and would warrant their own skill.

## Confirm the target first

**Do not start reviewing automatically.** Always begin by asking the user what to review. Do not auto-pick the current branch, guess from context, or jump straight into `gh pr diff`.

Ask a single short question, e.g.:

> What should I review? Reply with a PR number, "current branch", or a specific path.

Phrase the question in whichever language the user is using in the session. Wait for the user's reply before fetching anything. If the user already supplies a PR number or branch in the request — whether as a slash-command argument (`/hono-review 3845`) or in natural language (a "what do you think of PR #3845?" / "look at this branch" style message) — treat that as the answer and proceed without asking again. Only ask when the target is genuinely ambiguous.

## When to invoke

Activate not just on the slash command but whenever Yusuke makes a review-flavoured request about a PR or branch on `honojs/hono`. Typical shapes (in any language he is using):

- `/hono-review <PR#>` or `/hono-review`
- "what do you think of PR #XXXX?"
- "let's review PR XXXX together"
- "give PR XXXX a quick review"
- "look at this branch" / "review this diff"

Common situations:

- A community PR is open against `honojs/hono` and needs a maintainer-flavoured triage pass.
- A local branch in the `honojs/hono` checkout is about to be pushed or merged.
- A backport or security-fix branch needs a sanity check before landing.

## Inputs

Once the user has confirmed the target, pick whichever fits:

- **PR number**: `gh pr diff <N> --repo honojs/hono` for the patch, `gh pr view <N> --repo honojs/hono` for context. If anything beyond a static review is needed (running tests, type-perf check), `gh pr checkout <N>` locally first.
- **Local branch**: `git diff main...HEAD` for the patch, `git log main..HEAD --oneline` for the commit shape. Confirm the working tree is the `honojs/hono` repo.
- **Narrow review**: when the diff is wide, prioritise `src/**`, then `runtime-tests/**`, then everything else.

## Static review by default

The default mode is **static review**. Do **not** check the PR out locally just to start the review — `gh pr diff <N>` and `gh pr view <N>` (or `git diff main...HEAD` for the current branch) give enough context for the two checks below. CI already runs the test matrix and format/lint, so re-running them locally on every review is wasteful.

Escalate to a local checkout (`gh pr checkout <N>`) only when one of these applies:

- Yusuke explicitly asks to run things locally (e.g. "run it locally", "actually try it", or the equivalent in whichever language he is using).
- The static review surfaced something that needs running code to confirm (a suspected runtime edge case, a type-inference question that needs `tsserver`).
- CI is red and the failure isn't self-evident from the logs.

If a local checkout exists, the mechanical commands are:

```sh
bun run test
bun run format:fix && bun run lint:fix
```

Surface the result inside Issues: test failures block merge; `format:fix` / `lint:fix` diffs are listed as files the contributor needs to commit.

## Review checklist

Two checks. Everything else is "mention it only if you happen to notice it while doing these two" — never a starting point.

### 1. Tests

This is about the test **approach**, not just whether they pass. Even when CI is green, the wrong tests can pass.

- Edge cases covered, not just the happy path (empty body, wrong `Content-Type`, invalid `Accept-Encoding`, malformed headers, zero-length input, ...). Match the edge cases nearby tests already cover.
- Runtime-sensitive code has a `runtime-tests/<runtime>/` case. `compress`, body parsers, streaming, and cookie handling are the usual suspects.
- Public-type changes have a `*.test-d.ts` reflecting the new inference. If missing, ask for one.
- Test style matches the surrounding files (no random new helper / framework / abstraction introduced just for the diff).
- No `.skip` / `.only` / commented-out assertions left behind.
- If the diff adds behaviour without a test, that itself is an issue.

### 2. Breaking change

- Anything exported from `src/index.ts` or a preset (`src/preset/*`) — values **and** types — is the public contract.
- Renames, removals, signature changes, or changes to the `hc`-inferred shape are breaking even when runtime behaviour is identical. TS users hit it on the next compile.
- If a break is intentional, the deprecation flow should be visible in the diff: keep the old name as a re-export, mark it `@deprecated`, schedule removal for the next major.
- `hc` (RPC client) is especially load-bearing — its inferred shape *is* the public API.

## Things worth mentioning if you notice them

These are **not** checklist items — do not go looking for them. If, while doing the two checks above, one of these jumps out, fold it into Issues:

- Module-level mutable state (`Map`, `WeakMap`, lazy singletons, memoization layers) in `src/`. Core must stay isolate-safe; in-process caches can leak between requests/tenants on Workers-style runtimes.
- Node-only APIs (`node:fs`, `node:process`, `Buffer`, `__dirname`, `setImmediate`, ...) outside an adapter directory.
- New `import` that drags in unrelated code or top-level side effects (breaks tree-shaking; bundle size is a Hono headline).
- Generic-chain additions on `Hono` / `Context` / `Handler` / `Env` / `Schema` that look like they would slow `tsserver` visibly across user route chains.
- Anything that smells like a real security issue (parsing, header smuggling, cookie scope, CORS reflection, body re-read attacks, prototype pollution). **Stop and hand it to Yusuke** — do not write security findings into a public PR comment. Follow the GHSA runbook.

## How to present findings

Keep the output short. Four sections, in this order:

- **Summary** — one or two short sentences, **always present**. Lead with the **user-facing impact** (what was broken, what wasn't working, what the PR enables) in plain language a non-expert could follow. *Then* add a brief clue about how the fix works — file path is enough; do not stack three protocol/API names in a row to explain the mechanism. The maintainer hasn't read the diff yet; you are orienting them, not summarising the code.
- **Good** — 1–3 bullets on what the PR does right. Skip the section if there is nothing notable.
- **Issues** — what needs to change before merge. Most important first. Skip the section if none. For each issue:
  - Lead with a **one-line headline in bold** that names the problem at a glance — a noun phrase (e.g. "missing precedence test case", "node:fs import in core path"), not a full sentence. The reader should be able to scan headlines and immediately know *what* is wrong without reading the body. Match the language of the rest of the review.
  - Below the headline, two short lines:
    - **What**: the specifics in one sentence, citing `file:line`.
    - **Fix**: what to change (one sentence or a short code sketch).
  - Do **not** add a "Why" line. The headline + What + Fix should make the problem self-evident. If a reader can read all three and still ask "why is this a problem?", the headline or What is doing its job poorly — rewrite those rather than adding an explanation.
- **Verdict** — exactly one line: `merge OK`, `merge OK after issues fixed`, or `do not merge`.

The two-check structure is for *your* internal analysis, not for the output shape. Do not group findings by check, and do not use "blockers / suggestions / notes" tiers. Stop after the verdict line.

Tone is collaborative — you are handing material to a maintainer who will form their own judgment, not pronouncing a verdict for them. "merge OK" is a suggestion, not a decision.

## Voice

Write the review like you are explaining the PR to Yusuke over coffee, not delivering a technical report. He has the deep context; what he needs from the skill is something easy to *skim*.

- **Short sentences.** Cut anything that does not add information. If a sentence runs three lines on screen, split it.
- **Lead with the human-readable consequence, not the mechanism.** "Fixes a bug where Chrome refuses the WebSocket connection" lands instantly; "Implements echo-back of Sec-WebSocket-Protocol on the upgrade response" only lands after the reader has parsed three protocol names.
- **Jargon only when it actually shortens the sentence.** Terms like `subprotocol`, "echo back", "spread order" are fine when they are the most economical option — but pair them with a plain-language clue rather than chaining them. "Makes sure the user-supplied `options.protocol` wins" beats "places `...options` after the header-derived field in the spread so it wins".
- **Don't stack three technical nouns in a row.** It forces the reader to context-switch on every word.
- **Friendly, not formal.** Reviewer notes, not a CHANGELOG entry. Light chat-tone wording is welcome — match whichever language the user is using in the session.

The line between AI and Yusuke is at **remote-mutating actions**:

- **AI does** (locally, when Yusuke asks): `gh pr checkout`, edit files, run `bun run test` / `format:fix` / `lint:fix`, show `git status -sb` / `git diff`.
- **Yusuke does** (remote / commit-side): `git add`, `git commit`, `git push` (incl. force-push), `gh pr review`, `gh pr comment`, anything that updates the PR on GitHub.

## When Yusuke patches the contributor's branch

For minor fixes — typo, missing test case, format/lint diff the contributor forgot — Yusuke sometimes patches the contributor's branch directly. The skill handles the *local* prep so the path from "I want to fix this" to "ready to commit" is one step; Yusuke takes it from there.

**Trigger:** only act after Yusuke explicitly says he wants to patch the branch — phrasings along the lines of "I'll just fix it", "let me edit the branch", "add the test for me", "apply the format fix", or equivalents in whichever language he is using. Do not propose this unsolicited.

**Steps the skill does:**

1. `gh pr checkout <N>` — switch to the contributor's branch with the correct upstream. Confirm with `git status -sb` and verify the branch matches the PR. If the PR is from a fork without maintainer-edit permission, surface that immediately — there is no clean recovery.
2. Apply the edit Yusuke described. Stay within what he asked for; this is a light touch, not a rewrite.
3. Run the mechanical checks locally:

   ```sh
   bun run test
   bun run format:fix && bun run lint:fix
   ```

4. Show `git status -sb` and the relevant `git diff` so Yusuke can see exactly what will be committed.

**Then stop.** `git add` / `git commit` / `git push` are Yusuke's. Do not stage, do not draft a commit message and run it, do not push. If he asks for a commit-message suggestion, give it as text — let him run the command.

The Fix lines in the review output should already be concrete enough that this whole flow is a small step ("apply Fix #1, commit, push") rather than a discussion. Vague Fix lines like "add a test case" defeat the point — rewrite them to something paste-ready.

## What this skill is _not_

- Not a publish helper — `np` handles that locally.
- Not a CI replacement. CI runs the test matrix; this skill catches what CI cannot judge (test approach, breaking-change manners, things "worth mentioning if you notice them").

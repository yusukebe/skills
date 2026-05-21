---
name: contribute
title: Add or update a skill on skills.yusuke.run
description: How to add or update a skill in yusukebe/skills from inside another working project. Owner-only — uses Yusuke's local gh CLI auth.
tags: [meta, github, gh, ci, owner-only]
references:
  - https://github.com/yusukebe/skills
  - https://cli.github.com/manual/gh_api
related: []
---

# Add or update a skill on skills.yusuke.run

This skill describes how to contribute a new skill (or update an existing one) to the `yusukebe/skills` repo **from a different working project**, without leaving that project.

> **Owner-only.** The flow uses the `gh` CLI authenticated as `yusukebe`. If you are an agent working on someone else's machine, you cannot push to `yusukebe/skills` — skip this skill.

## When to do this

- You are in the middle of working on some other repo with Yusuke.
- Yusuke just confirmed an opinionated way to do something that would be reusable across future projects.
- **Ask first.** "Want me to add a skill for this on skills.yusuke.run?" Proceed only on explicit yes — the catalog reflects Yusuke's opinions and must not silently grow.

## The flow

The catalog uses the `vercel-labs/skills` layout: each skill is a directory under `skills/` with a `SKILL.md` inside. The registry is regenerated automatically before each deploy from `skills/*/SKILL.md`, so all you need to add is one Markdown file in the right place. PR → auto-merge → Cloudflare Workers Builds deploys.

### 1. Pick a name

`kebab-case`, short, descriptive. The name doubles as the directory name and the URL slug. Look at <https://skills.yusuke.run/skills.json> to keep naming consistent with the existing catalog.

### 2. Write the skill body locally

Save it as `/tmp/SKILL.md` (or any temp path). Required frontmatter — the `name` field is what `npx skills add` looks for:

```markdown
---
name: <name>
title: <one-sentence title>
description: <one-line description shown in the root index>
tags: [<lowercase>, <kebab-case>]
references:
  - https://...
related: []
---

# ...
```

Follow the prose conventions: one paragraph per line, no hard wraps, English. Aim for "opinionated guidance + links into the web" rather than a tutorial. If the topic has no good web resource, write the guidance out in full.

### 3. Create a branch and add the file via the GitHub API

```sh
NAME=<name>
BRANCH=add-skill-$NAME
MAIN_SHA=$(gh api repos/yusukebe/skills/git/refs/heads/main --jq '.object.sha')

gh api repos/yusukebe/skills/git/refs \
  -f ref="refs/heads/$BRANCH" \
  -f sha="$MAIN_SHA"

gh api -X PUT "repos/yusukebe/skills/contents/skills/$NAME/SKILL.md" \
  -f message="add $NAME skill" \
  -f branch="$BRANCH" \
  -f content="$(base64 < /tmp/SKILL.md)"
```

Creating the file at the nested path `skills/$NAME/SKILL.md` implicitly creates the `skills/$NAME/` directory — there is no separate "create directory" call.

### 4. Open the PR and enable auto-merge

```sh
gh pr create \
  --repo yusukebe/skills \
  --base main \
  --head "$BRANCH" \
  --title "add $NAME skill" \
  --body "Adds the \`$NAME\` skill. Auto-proposed from another project."

gh pr merge --repo yusukebe/skills "$BRANCH" --squash --auto
```

Cloudflare Workers Builds picks up the merged commit on `main` and deploys.

## Updating an existing skill

Same flow, but step 3 looks like this — fetch the current file's `sha` first and pass it in:

```sh
NAME=<name>
BRANCH=update-skill-$NAME
MAIN_SHA=$(gh api repos/yusukebe/skills/git/refs/heads/main --jq '.object.sha')
FILE_SHA=$(gh api "repos/yusukebe/skills/contents/skills/$NAME/SKILL.md?ref=main" --jq '.sha')

gh api repos/yusukebe/skills/git/refs \
  -f ref="refs/heads/$BRANCH" \
  -f sha="$MAIN_SHA"

gh api -X PUT "repos/yusukebe/skills/contents/skills/$NAME/SKILL.md" \
  -f message="update $NAME skill" \
  -f branch="$BRANCH" \
  -f content="$(base64 < /tmp/SKILL.md)" \
  -f sha="$FILE_SHA"
```

Then the same `gh pr create` + `gh pr merge --auto` as above.

## Confirm with the user first

Do not push to the catalog without an explicit go-ahead from Yusuke. If unsure whether a piece of knowledge is "catalog-worthy" or just a one-off, lean toward asking.

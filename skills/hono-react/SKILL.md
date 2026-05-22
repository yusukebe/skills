---
name: hono-react
title: Use React (not hono/jsx) on top of Hono
description: When a project on Hono needs real React — for the React component ecosystem, SSR, or an SPA — drop hono/jsx and wire React in via vite-ssr-components.
tags: [hono, react, ssr, vite, cloudflare-workers, inertia]
references:
  - https://github.com/yusukebe/vite-ssr-components
  - https://hono.dev/
  - https://inertiajs.com/
  - https://github.com/honojs/starter/tree/main/templates/cloudflare-workers+vite
related: [hono, hono-inertia, cloudflare]
---

# Use React (not hono/jsx) on top of Hono

`hono/jsx` is the default for UI in a Hono project. Reach for **React** only when something that hono/jsx cannot satisfy makes it necessary — typically a React-only component library, a React-only ecosystem tool (e.g. a specific UI kit, charting library, headless component set), or a team requirement to standardize on React.

When that is the case, do not try to bridge hono/jsx to React. Rewrite the JSX in React and treat Hono as the server framework only.

## When to reach for this skill

- The UI needs a React-only library that has no hono/jsx equivalent.
- You want full React SSR with hydration, not the lighter `hono/jsx/dom` model.
- The team has standardized on React and the Hono side is just the server.

If none of the above applies, stay on hono/jsx — it is smaller, faster to ship, and the default for this stack. See [`hono`](/skills/hono) and (for SPA-feel apps) [`hono-inertia`](/skills/hono-inertia).

## Stack

- **Server:** `hono`. Routes, middleware, validation — unchanged from any other Hono project.
- **UI:** React (`react`, `react-dom`).
- **Bundling + SSR:** Vite, plus **[`vite-ssr-components`](https://github.com/yusukebe/vite-ssr-components)** for the asset wiring (Vite client, asset tags, module preloads) inside Hono responses. Use the **`/react`** entry, not `/hono`.
- **Deployment:** Usually Cloudflare Workers via `@cloudflare/vite-plugin`. Start from the `cloudflare-workers+vite` Hono starter:
  <https://github.com/honojs/starter/tree/main/templates/cloudflare-workers+vite>

## Migrating from hono/jsx to React

The rewrite is mechanical but real — do not try to keep both:

- Remove `jsxImportSource: "hono/jsx"` from `tsconfig.json` (or switch it to `react`).
- Replace `hono/jsx` and `hono/jsx/dom` imports with `react` / `react-dom`.
- Switch `vite-ssr-components/hono` to `vite-ssr-components/react` in the root view / document component.
- Rewrite any hono/jsx-specific hooks or helpers (`useState` from `hono/jsx`, `hono/jsx/dom/css`, etc.) to their React equivalents.
- Confirm SSR output: React SSR has different streaming/hydration semantics than `hono/jsx/dom`.

## Routing on the client

Once you are on React, the client-side routing question is open — pick what fits the app:

- **Inertia.js** — works as-is with React (this is in fact its native target). If you want SPA-feel without writing a JSON API, this is the most direct option. The canonical example `yusukebe/hono-inertia-example` is written in React, so it transfers verbatim. (Contrast: the [`hono-inertia`](/skills/hono-inertia) skill is the hono/jsx variant — use that if you do _not_ need React.)
- **React Router**, **TanStack Router**, etc. — fine. Hono just serves the shell + data endpoints; the router runs in the browser.
- **No router at all** — also fine for a single-screen app. Use Hono for routes, React for the view.

There is no "official" choice here. Pick the one whose tradeoffs (file-based vs. config, data-loading model, SSR story) match the app.

## Reference: vite-ssr-components

`vite-ssr-components` (yusukebe) is the small adapter that lets a Hono response correctly include the Vite dev client, hashed asset URLs, and module preloads in both `vite dev` and a production build. It has separate entries for the two JSX flavors:

- `vite-ssr-components/hono` — for hono/jsx projects.
- `vite-ssr-components/react` — for React projects. **This is what to use here.**

Read its README for the exact API:

<https://github.com/yusukebe/vite-ssr-components>

## Pitfalls

- **Bundle size.** React + react-dom is significantly heavier than `hono/jsx/dom`. If the only reason for the switch is "we wanted hooks", reconsider — hono/jsx has its own hooks.
- **SSR fidelity.** React SSR is mature, but you still have to think about streaming vs. blocking, `Suspense` boundaries, and what runs only on the client. Verify the first paint of any route before shipping.
- **Workers runtime.** Use `react-dom/server` paths that are compatible with the Workers runtime (no Node-only APIs). The `@cloudflare/vite-plugin` toolchain handles this if you start from the official template.
- **Do not mix hono/jsx and React in one app.** Pick one. Two JSX runtimes in the same bundle is a guaranteed source of pain.

## Related

- [`hono`](/skills/hono) — the base Hono skill. Start here.
- [`hono-inertia`](/skills/hono-inertia) — Inertia.js with **hono/jsx** (no React). Reach for that one first if you do not actually need React.
- [`cloudflare`](/skills/cloudflare) — the deployment target.

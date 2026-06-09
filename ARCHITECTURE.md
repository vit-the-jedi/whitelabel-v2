# Whitelabel Quote Funnel — Foundation

A brand-configurable, multi-step insurance quote funnel built on **Next.js (App
Router) + React**, using the **real-routes + layout-persisted context** pattern.

The governing idea: **a brand's funnel is data, not code.** A `FlowConfig`
describes which steps, in what order, branching on what. The reducer, context,
and routes just *interpret* that data — so adding a brand or reordering steps is
a content change, not a code change.

---

## Why this shape

| Concern | Where it lives | Why |
| --- | --- | --- |
| "Which steps, what order, what branches" | `FlowConfig` (data, ideally Hygraph) | One brand ≠ one fork of the route tree |
| "Given answers, what's next / am I allowed here" | `flowReducer` + `logic.ts` (pure) | Branching is testable, decoupled from URL |
| Accumulated answers (source of truth) | reducer state in client memory | Small object, commits once per step |
| Distribution of that state | React Context (2 providers) | At 1–5 fields/step the Context re-render tax never bites; no external store needed |
| Refresh / resume | server-fetched `Draft`, keyed by `quoteId` | Live context dies on hard reload; the draft re-seeds it |
| Brand shell, theme, static step copy | Server Components | Whitelabel resolved server-side, zero client flash |
| Where the user is | URL mirrors reducer state | Real back button, deep links, per-step SSR |

**The keystone:** `QuoteProvider` is mounted in the quote **layout**, not a
page. App Router layouts don't unmount across soft navigation, so the reducer
state survives step-to-step *while each step page still server-renders fresh*.
That's how you get real routes without losing in-memory state.

---

## Dependencies

Runtime: **none beyond Next.js + React.** The whole engine is plain TypeScript +
`useReducer` + Context by design.

```bash
npx create-next-app@latest whitelabel-quote --typescript --app --src-dir
# then drop the src/ files from this scaffold in
```

Optional, recommended as you grow:

- **zod** — swap the hand-rolled `validateStep` for per-step schemas when rules
  get richer (cross-field, async). The controller contract (`{ ok, errors }`)
  stays identical. `npm i zod`
- **@sentry/nextjs** — wire into the `RESOLVE_ERROR` branch in `QuoteProvider`
  (marked with a comment). `npm i @sentry/nextjs`
- **xstate** — only if branching-after-async grows complex. It would replace the
  `status` slice of the reducer; nothing else changes. `npm i xstate @xstate/react`

### Required config

Add the `@/*` path alias (the files import `@/lib/...`, `@/components/...`):

```jsonc
// tsconfig.json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": { "@/*": ["./src/*"] }
  }
}
```

---

## File map

```
src/
├─ lib/flow/
│  ├─ types.ts        Domain types: FlowConfig, StepDef, Guard, Draft, BrandTheme
│  ├─ logic.ts        Pure fns: resolveNext, validateStep, stepPath  (unit-test these)
│  ├─ machine.ts      The brain: FlowState, actions, flowReducer, buildInitialState
│  ├─ resolvers.ts    Async side effects (rater / companyInfo) run on submit
│  └─ config.ts       Server fetchers + an example 2-brand config (the payoff)
├─ components/quote/
│  ├─ QuoteProvider.tsx   ★ the context layer — 2 contexts, controller, guard hook
│  ├─ StepForm.tsx        Client island: inputs, commit-on-submit, back
│  └─ StepGuard.tsx       Zero-render wrapper so a server page can run the guard
└─ app/[brand]/quote/
   ├─ layout.tsx          Server: resolve brand/theme/config/draft, mount provider
   └─ [...step]/page.tsx  Server: SSR static step content + client form island
```

Start in `QuoteProvider.tsx` — it's the centerpiece and references everything else.

---

## The action vocabulary (what controls the flow)

Components report **events**, never destinations. The machine + config decide
where to go:

- `submitStep(answers)` → validate → commit → run resolver (if any) → branch via
  `resolveNext` → advance → push URL. ~90% of forward motion.
- `goBack()` → pops the **visited stack** (not `index - 1` — branching makes
  those different).
- `jumpTo(stepId)` → edit-from-review; guarded to already-completed steps.
- `HYDRATE` → restore from the server-fetched draft.

Async steps (rater, company lookup) don't transition synchronously: the machine
enters `resolving`, the resolver writes its result into answers, and `next`
guards branch on that result. Continue-vs-decline stays declarative in config.

---

## What's stubbed (wire these to ship)

1. **`config.ts` fetchers** — replace in-memory `getFlowConfig` / `getBrandTheme`
   with Hygraph queries; `getDraft` with your draft store (Postgres / Redis / KV).
2. **`resolvers.ts`** — point `rater` / `companyInfo` at real API routes.
3. **Draft persistence** — `QuoteProvider.persist()` PATCHes `/api/quote/[id]`;
   build that route. Debounce it; it's best-effort and must never block nav.
4. **`quoteId` cookie** — `layout.tsx` reads it and generates a fallback but does
   not *set* it. Set it in middleware or a session-start route so it persists.
5. **Server-side guard backstop** — `StepGuard` reconciles client-side. For
   hard deep-links, also validate the URL step against the persisted draft in
   `page.tsx` before render and `redirect()` if it's ahead of progress.
6. **Styling** — components use bare inline styles as placeholders; theme CSS
   vars (`--brand-primary`, etc.) are already set on the layout wrapper.

---

## Build order

1. `npm run dev`, hit `/acme/quote` and `/beacon/quote` — the two example brands
   run different sequences off the same engine immediately.
2. Add unit tests for `resolveNext` / `validateStep` (pure, fast, high value).
3. Replace `config.ts` stubs with Hygraph.
4. Build `/api/quote/[id]` (draft) and `/api/rate`, `/api/company-info` (resolvers).
5. Set the `quoteId` cookie + server-side guard backstop.
6. Style the steps; wire Sentry into the `RESOLVE_ERROR` branch.

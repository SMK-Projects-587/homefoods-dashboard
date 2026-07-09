# HomeFoods Dashboard

Staff admin dashboard for HomeFoods — manage categories, products (with
variants and images), and view/update orders. Talks directly to the
[`homefoods-new`](../homefoods-new) Supabase backend via `supabase-js`; there
is no application server of its own.

Every authenticated user is staff/admin (see the backend's trust model) —
there is **no register page**, only sign-in. Staff accounts are created
manually; see `homefoods-new/README.md`.

## Stack

| Layer         | Tool                                           |
| ------------- | ---------------------------------------------- |
| Framework     | React 19 + TypeScript                          |
| Bundler       | Vite 8                                         |
| Routing       | TanStack Router (code-based route tree)        |
| Data fetching | TanStack Query                                 |
| Tables        | TanStack Table                                 |
| Client state  | Zustand (auth session only)                    |
| Forms         | React Hook Form + Zod                          |
| UI            | shadcn/ui (Radix primitives) + Tailwind CSS v4 |
| Backend       | Supabase (`@supabase/supabase-js`)             |
| Testing       | Vitest + React Testing Library + MSW           |

## Getting started

```bash
cp .env.example .env   # local Supabase stack values are already filled in
pnpm install
pnpm dev
```

The `.env.example` values point at the **local** Supabase stack started from
`../homefoods-new` (`npx supabase start`). For the hosted project, replace
`VITE_SUPABASE_URL` / `VITE_SUPABASE_ANON_KEY` with the values from
`npx supabase projects api-keys`.

Staff sign-in only — create a user via the backend's admin API or Studio
(see `homefoods-new/README.md` → "Auth: how staff users are created").

## Scripts

| Script         | Description                          |
| -------------- | ------------------------------------ |
| `pnpm dev`     | Start the dev server                 |
| `pnpm build`   | Type-check and build for production  |
| `pnpm preview` | Preview the production build locally |
| `pnpm lint`    | Run ESLint                           |
| `pnpm format`  | Format everything with Prettier      |
| `pnpm test`    | Run tests once                       |

## Project structure

```
src/
├── components/
│   ├── ui/            # shadcn/ui primitives (button, dialog, table, sidebar, ...)
│   ├── layout/         # AppShell, sidebar, topbar
│   ├── data-table.tsx # generic TanStack Table wrapper used by every list
│   └── confirm-dialog.tsx
├── features/
│   ├── auth/           # zustand session store, sign-in/out, LoginForm
│   ├── categories/      # list/create/edit/delete
│   ├── products/       # list/create/edit, variants, R2-backed images
│   └── orders/         # list/detail, status updates
├── hooks/              # shared hooks (use-image-url, use-mobile)
├── lib/
│   ├── supabase.ts     # supabase-js client (typed via src/types/database.ts)
│   ├── storage.ts      # r2-presign edge function client (image upload/delete)
│   └── utils.ts         # cn()
├── pages/               # route-level components
├── types/database.ts    # generated Supabase types (copy from homefoods-new)
└── router.tsx            # TanStack Router route tree + auth guard
```

Each feature exports its public API from `index.ts` only — don't reach into
another feature's internals directly.

## Auth

`src/features/auth/store.ts` holds the Supabase session in a small Zustand
store so `router.tsx`'s `beforeLoad` guards can read it synchronously (outside
React). `main.tsx` awaits the initial `supabase.auth.getSession()` before
mounting the app, then subscribes to `onAuthStateChange` and calls
`router.invalidate()` on every change so route guards re-evaluate. There is
no register route — sign-ups are disabled at the Supabase project level.

## Images (Cloudflare R2)

Product images upload through the backend's `r2-presign` edge function (the
browser never holds R2 credentials): `src/lib/storage.ts` requests a
presigned PUT/GET/DELETE URL over the staff's JWT, then talks to R2 directly.
See `homefoods-new/supabase/functions/r2-presign`.

## Mobile

The whole app is mobile-first: the sidebar collapses into a slide-over sheet
below the `md` breakpoint (shadcn's `Sidebar` component), forms stack to a
single column, and tables scroll horizontally in a bordered container rather
than overflowing the page.

## Path alias

`@/` maps to `src/`.

## React Compiler

Enabled via Babel — you generally don't need `useMemo`/`useCallback`
manually. ESLint will flag `react-hooks/incompatible-library` for
`react-hook-form`'s `watch()` and TanStack Table's `useReactTable()`; both are
expected and don't need manual memoization workarounds.

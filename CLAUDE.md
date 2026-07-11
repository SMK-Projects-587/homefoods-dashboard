# CLAUDE.md

Conventions for this codebase. Read before editing anything.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, TanStack Router/Query/Table,
Zustand, React Hook Form + Zod, shadcn/ui (Radix), Supabase (`supabase-js`).
Package manager: **pnpm**.

## Folder structure

```
src/
├── assets/          # Static files (images, SVGs, fonts)
├── components/
│   ├── ui/          # shadcn/ui primitives — generated via `npx shadcn add`, kept kebab-case, don't hand-edit style
│   └── app/         # Shared app components, one folder each: <Name>/<Name>.component.tsx + index.ts
│       ├── AppShell/, AppSidebar/, Topbar/   # layout shell (was components/layout)
│       └── DataTable/, ConfirmDialog/        # shared across features
├── features/        # Self-contained feature modules
│   └── [feature]/
│       ├── api.ts               # supabase-js calls, one function per operation
│       ├── types.ts             # Tables<>/TablesInsert<>/TablesUpdate<> aliases
│       ├── schemas.ts           # zod schemas + inferred form value types (only if exported elsewhere)
│       ├── hooks/               # tanstack-query hooks — camelCase files (useX.ts / useCreateX ...)
│       ├── components/          # flat <Name>.component.tsx files
│       └── index.ts             # Public API — only export what other features need
├── hooks/           # Shared custom hooks (camelCase: useMobile.ts, useImageUrl.ts)
├── lib/
│   ├── supabase.ts  # typed supabase-js client
│   ├── storage.ts   # r2-presign client (image upload/download/delete)
│   ├── queryClient.ts # tanstack-query client
│   └── utils.ts     # cn() and other pure utilities
├── pages/           # Route-level components — <Name>.page.tsx (thin, compose feature components)
├── types/database.ts # generated Supabase types — copy from homefoods-new, don't hand-edit
└── routes/router.tsx # TanStack Router route tree (code-based, not file-based)
```

Keep things close to where they're used. Promote to a shared folder only when two or more features need it. Never import from inside another feature — only from its `index.ts`.

## File naming

- **Components & containers** — PascalCase with a `.component.tsx` suffix (`OrdersTable.component.tsx`). Shared app components in `components/app/` get their own folder + `index.ts` barrel (`components/app/DataTable/DataTable.component.tsx` + `index.ts`); feature components stay flat inside `features/<f>/components/`.
- **Pages** — PascalCase with a `.page.tsx` suffix (`OrdersPage.page.tsx`).
- **Everything else** (hooks, api, types, schemas, stores, utils) — camelCase (`useOrders.ts`, `queryClient.ts`).
- **`components/ui/`** — left as shadcn generates them (kebab-case), don't rename.
- **Exports** — named exports everywhere; no default exports.

## Data fetching

- All Supabase access goes through a feature's `api.ts` — components never call `supabase` directly.
- Wrap every `api.ts` function in a TanStack Query hook (`hooks/useX.ts`). Query keys live next to the hooks (`export const xKey = [...]`).
- Mutations invalidate their own list/detail query keys and show a `sonner` toast on success/error — see `features/categories/hooks/useCategories.ts` for the pattern.
- Blank `slug`/`sku` fields are intentional: DB triggers auto-generate them. The generated `Insert` types mark these as required strings, so pass `''` explicitly rather than omitting the field.

## Forms

React Hook Form + Zod (`zodResolver`) for everything with more than one or two fields. Keep the zod schema and its inferred `type X = z.infer<...>` in the same file as the form component — unless the type is needed outside that file, in which case move both into a `schemas.ts` in the feature (see `features/products/schemas.ts`) to avoid `react-refresh/only-export-components` lint errors.

## Auth

`features/auth/store.ts` is a plain Zustand store (not just a hook) so `routes/router.tsx`'s `beforeLoad` guards can read the session synchronously via `useAuthStore.getState()` outside React. `main.tsx` awaits the initial session before mounting, then keeps the store in sync via `onAuthStateChange` + `router.invalidate()`. There is no register flow.

## Components

```tsx
import { cn } from '@/lib/utils';

interface CardProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export function Card({ title, className, children }: CardProps) {
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

- Props interface named `[ComponentName]Props`, defined directly above the component.
- Named exports everywhere.
- Always accept and forward a `className` prop on any component that renders a root element.

## Mobile-first — non-negotiable

This is a staff dashboard meant to be used from a phone on the shop floor. Every new screen must work at ~375px wide before it's considered done:

- Default (no breakpoint prefix) styles are the mobile layout; add `sm:`/`md:` to expand for larger screens, not the other way round.
- Use the existing `AppShell` (`components/app/AppShell/AppShell.component.tsx`) — its `Sidebar` collapses into a Sheet drawer below `md` automatically (shadcn's `Sidebar` component). Don't build a second nav pattern.
- Wrap tabular data in `DataTable` (`components/app/DataTable/DataTable.component.tsx`), which already scrolls horizontally in a bordered container — don't let a table overflow the page.
- Forms stack in a single column by default; only go to `sm:grid-cols-2` for short paired fields (see `ProductDetailsForm`).
- Dialogs (`components/ui/dialog.tsx`) are already responsive (near-full-width under `sm`); don't hardcode a fixed `width`.

## Styling

Always use `cn()` from `@/lib/utils` to compose class names. Never concatenate Tailwind strings manually.

```tsx
// correct
<div className={cn('px-4 py-2', isActive && 'bg-blue-500', className)} />

// wrong
<div className={`px-4 py-2 ${isActive ? 'bg-blue-500' : ''}`} />
```

No inline `style={{}}` unless handling a value Tailwind can't express. No component-scoped CSS files. Theme tokens (`--background`, `--primary`, etc.) live in `src/index.css`; add new tokens there, not as one-off hex values in components.

## Imports

Use `@/` for everything outside the current folder. Relative imports (`./`, `../`) are fine within the same component or feature folder. Import order is enforced by ESLint — run `pnpm eslint --fix` to auto-sort.

## TypeScript

- `interface` for object shapes, `type` for unions, intersections, and aliases.
- No `any`. Use `unknown` and narrow it.
- Prefix intentionally unused variables and args with `_`.
- Row/Insert/Update types come from `src/types/database.ts` via the `Tables<>`, `TablesInsert<>`, `TablesUpdate<>` helpers — don't hand-write table shapes.

## Testing

- Co-locate tests: `Button.test.tsx` lives next to `Button.tsx`.
- Query by accessible role, label, or text — not by class name or `data-testid`.
- Use `userEvent` over `fireEvent` for all interactions.
- Mock network requests with MSW handlers in `src/mocks/handlers.ts` — don't mock `fetch` directly. For Supabase calls, prefer mocking the feature's `api.ts` module instead of MSW-intercepting PostgREST requests.

## Commits

[Conventional Commits](https://www.conventionalcommits.org).

```
feat: add user profile page
fix: prevent form double-submit
chore: upgrade vitest
refactor: extract useAuth hook
test: cover token expiry edge case
```

Note: husky/commitlint hooks aren't wired up in this repo yet (the template's `.husky` + `commitlint.config.ts` are present but `prepare` isn't run automatically) — follow the convention manually until that's set up.

## Before finishing a task

```bash
pnpm lint && pnpm tsc -b --noEmit
```

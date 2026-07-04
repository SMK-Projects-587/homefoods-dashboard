# CLAUDE.md

Conventions for this codebase. Read before editing anything.

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, Vitest + React Testing Library + MSW. Package manager: **pnpm**.

## Folder structure

```
src/
├── assets/          # Static files (images, SVGs, fonts)
├── components/      # Shared UI components
│   └── ui/          # Primitive components: Button, Input, Badge, etc.
├── features/        # Self-contained feature modules
│   └── [feature]/
│       ├── components/
│       ├── containers/
│       ├── hooks/
│       ├── types.ts
│       └── index.ts # Public API — only export what other features need
├── hooks/           # Shared custom hooks
├── lib/
│   └── utils.ts     # cn() and other pure utilities
├── mocks/           # MSW handlers and server setup
├── pages/           # Route-level components
└── types/           # Shared TypeScript types
```

Keep things close to where they're used. Promote to a shared folder only when two or more features need it. Never import from inside another feature — only from its `index.ts`.

## Components

```tsx
import { cn } from '@/lib/utils';

interface CardProps {
  title: string;
  className?: string;
  children: React.ReactNode;
}

export default function Card({ title, className, children }: CardProps) {
  return (
    <div className={cn('rounded-lg border p-4', className)}>
      <h2>{title}</h2>
      {children}
    </div>
  );
}
```

- Props interface named `[ComponentName]Props`, defined directly above the component.
- Default export for components and pages; named exports for hooks, utilities, and types.
- Always accept and forward a `className` prop on any component that renders a root element.

## Styling

Always use `cn()` from `@/lib/utils` to compose class names. Never concatenate Tailwind strings manually.

```tsx
// correct
<div className={cn('px-4 py-2', isActive && 'bg-blue-500', className)} />

// wrong
<div className={`px-4 py-2 ${isActive ? 'bg-blue-500' : ''}`} />
```

No inline `style={{}}` unless handling a value Tailwind can't express (e.g. a dynamic CSS variable). No component-scoped CSS files.

## Imports

Use `@/` for everything outside the current folder. Relative imports (`./`, `../`) are fine within the same component or feature folder.

```ts
import { cn } from '@/lib/utils'; // good
import { cn } from '../../lib/utils'; // bad
```

Import order is enforced by ESLint — run `pnpm eslint --fix` to auto-sort.

## TypeScript

- `interface` for object shapes, `type` for unions, intersections, and aliases.
- No `any`. Use `unknown` and narrow it.
- Prefix intentionally unused variables and args with `_`.

## Testing

- Co-locate tests: `Button.test.tsx` lives next to `Button.tsx`.
- Query by accessible role, label, or text — not by class name or `data-testid`.
- Use `userEvent` over `fireEvent` for all interactions.
- Mock network requests with MSW handlers in `src/mocks/handlers.ts` — don't mock `fetch` directly.

## Commits

[Conventional Commits](https://www.conventionalcommits.org) — commitlint enforces this.

```
feat: add user profile page
fix: prevent form double-submit
chore: upgrade vitest
refactor: extract useAuth hook
test: cover token expiry edge case
```

## Before finishing a task

```bash
pnpm lint && pnpm tsc --noEmit
```

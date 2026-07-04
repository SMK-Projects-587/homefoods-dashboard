# React Starter Template

A batteries-included React starter with an opinionated, production-ready toolchain. Clone, install, and ship.

## Stack

| Layer      | Tool                                   |
| ---------- | -------------------------------------- |
| Framework  | React 19 + TypeScript                  |
| Bundler    | Vite 8                                 |
| Styling    | Tailwind CSS v4                        |
| Linting    | ESLint (flat config) + jsx-a11y        |
| Formatting | Prettier + prettier-plugin-tailwindcss |
| Testing    | Vitest + React Testing Library + MSW   |
| Git hooks  | Husky + lint-staged + commitlint       |

## Getting started

```bash
pnpm install
pnpm dev
```

## Scripts

| Script               | Description                          |
| -------------------- | ------------------------------------ |
| `pnpm dev`           | Start the dev server                 |
| `pnpm build`         | Type-check and build for production  |
| `pnpm preview`       | Preview the production build locally |
| `pnpm lint`          | Run ESLint                           |
| `pnpm format`        | Format everything with Prettier      |
| `pnpm test`          | Run tests once                       |
| `pnpm test:ui`       | Open the Vitest UI                   |
| `pnpm test:coverage` | Run tests with coverage report       |

## Project structure

```
src/
├── lib/
│   └── utils.ts        # cn() helper (clsx + tailwind-merge)
├── mocks/
│   ├── handlers.ts     # MSW request handlers
│   └── server.ts       # MSW Node server (used in tests)
└── ...
vitest.setup.ts          # Global test setup (jest-dom + MSW)
commitlint.config.ts     # Conventional commit rules
```

## Path alias

`@/` maps to `src/`. Use it everywhere instead of relative paths.

```ts
import { cn } from '@/lib/utils';
```

## Styling

Tailwind v4 is configured via the `@tailwindcss/vite` plugin — no `tailwind.config.js` needed. The `cn()` utility merges class names safely:

```ts
import { cn } from '@/lib/utils';

<div className={cn('px-4 py-2', isActive && 'bg-blue-500')} />
```

## Testing

Tests use Vitest with jsdom and React Testing Library. MSW intercepts network requests — add handlers to `src/mocks/handlers.ts`.

```tsx
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

it('does something', async () => {
  const user = userEvent.setup();
  render(<MyComponent />);
  await user.click(screen.getByRole('button', { name: /submit/i }));
  expect(screen.getByText('Done')).toBeInTheDocument();
});
```

## Commit convention

Commits are linted against the [Conventional Commits](https://www.conventionalcommits.org) spec via commitlint.

```
feat: add dark mode toggle
fix: correct counter overflow
chore: bump dependencies
docs: update README
```

## Git hooks

| Hook         | What it does                            |
| ------------ | --------------------------------------- |
| `pre-commit` | ESLint --fix + Prettier on staged files |
| `commit-msg` | Validates commit message format         |

## React Compiler

The [React Compiler](https://react.dev/learn/react-compiler) is enabled via Babel. It automatically memoizes components and hooks — you generally don't need `useMemo` or `useCallback` manually.

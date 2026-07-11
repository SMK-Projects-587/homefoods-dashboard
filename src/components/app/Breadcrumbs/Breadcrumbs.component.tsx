import { Fragment } from 'react';

import { Link, type LinkProps, useMatches } from '@tanstack/react-router';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

/**
 * One breadcrumb segment. Omit `to` for the current (non-link) page.
 * `to` is a plain string here (not `LinkProps['to']`) to avoid a circular
 * type: this interface feeds the router's `staticData`, which `LinkProps`
 * itself depends on. It's cast back to a typed route at the `Link` call site.
 */
export interface Crumb {
  label: string;
  to?: string;
}

// Lets each route declare its trail via `staticData: { breadcrumb: [...] }`.
declare module '@tanstack/react-router' {
  interface StaticDataRouteOption {
    breadcrumb?: Crumb[];
  }
}

interface BreadcrumbsProps {
  className?: string;
}

/**
 * Renders the breadcrumb trail for the active route, read from the deepest
 * matched route's `staticData.breadcrumb`. Renders nothing for routes without
 * a trail (or a single-segment one, e.g. the dashboard).
 */
export function Breadcrumbs({ className }: BreadcrumbsProps) {
  const matches = useMatches();
  const crumbs = [...matches]
    .reverse()
    .find((match) => match.staticData.breadcrumb)?.staticData.breadcrumb;

  if (!crumbs || crumbs.length <= 1) return null;

  return (
    <Breadcrumb className={className}>
      <BreadcrumbList>
        {crumbs.map((crumb, index) => {
          const isLast = index === crumbs.length - 1;
          return (
            <Fragment key={`${crumb.label}-${index}`}>
              <BreadcrumbItem>
                {isLast || !crumb.to ? (
                  <BreadcrumbPage>{crumb.label}</BreadcrumbPage>
                ) : (
                  <BreadcrumbLink asChild>
                    <Link to={crumb.to as LinkProps['to']}>{crumb.label}</Link>
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}

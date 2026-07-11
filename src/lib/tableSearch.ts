import type { SortState } from './pagination';

/** URL search shape shared by every list route. Filters add their own keys. */
export interface CommonTableSearch {
  page?: number;
  q?: string;
  sort?: string;
}

export interface OrdersTableSearch extends CommonTableSearch {
  status?: string;
}

export interface ProductsTableSearch extends CommonTableSearch {
  category?: string;
  active?: string;
}

/** `"name"` → asc, `"-name"` → desc. */
export function parseSort(value: string | undefined): SortState | undefined {
  if (!value) return undefined;
  return value.startsWith('-')
    ? { id: value.slice(1), desc: true }
    : { id: value, desc: false };
}

export function serializeSort(sort: SortState): string {
  return (sort.desc ? '-' : '') + sort.id;
}

/** `validateSearch` coercion for the page/q/sort params every list route shares. */
export function parseCommonSearch(
  search: Record<string, unknown>,
): CommonTableSearch {
  const out: CommonTableSearch = {};
  const page = Number(search.page);
  if (Number.isFinite(page) && page > 1) out.page = Math.floor(page);
  if (typeof search.q === 'string' && search.q.trim()) out.q = search.q;
  if (typeof search.sort === 'string' && search.sort) out.sort = search.sort;
  return out;
}

/** Pull a single non-empty string filter param out of raw search. */
export function parseStringParam(
  search: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = search[key];
  return typeof value === 'string' && value ? value : undefined;
}

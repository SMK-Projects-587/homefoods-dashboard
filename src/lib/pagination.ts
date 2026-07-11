export interface SortState {
  id: string;
  desc: boolean;
}

export interface ListParams {
  page: number; // 0-based page index
  pageSize: number;
  search?: string;
  sort?: SortState;
}

export interface Paginated<T> {
  rows: T[];
  total: number;
  pageCount: number;
}

/** Inclusive `[from, to]` row range for a `.range()` call. */
export function rangeFor(page: number, pageSize: number): [number, number] {
  const from = page * pageSize;
  return [from, from + pageSize - 1];
}

export function toPaginated<T>(
  rows: T[] | null,
  count: number | null,
  pageSize: number,
): Paginated<T> {
  const total = count ?? 0;
  return {
    rows: rows ?? [],
    total,
    pageCount: Math.max(1, Math.ceil(total / pageSize)),
  };
}

/** Keep a sort only if the server knows how to apply it; else fall back. */
export function resolveSort(
  sort: SortState | undefined,
  allowed: readonly string[],
  fallback: SortState,
): SortState {
  if (sort && allowed.includes(sort.id)) return sort;
  return fallback;
}

/** Strip characters that would break a PostgREST `.or()` filter string. */
export function sanitizeSearch(search: string | undefined): string {
  return (search ?? '').replace(/[,()]/g, ' ').trim();
}

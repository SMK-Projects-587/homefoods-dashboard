import { useEffect, useRef, useState } from 'react';

import { useNavigate, useSearch } from '@tanstack/react-router';
import type { OnChangeFn, SortingState } from '@tanstack/react-table';

import type { DataTableServer } from '@/components/app/DataTable';
import type { ListParams, SortState } from '@/lib/pagination';
import { parseSort, serializeSort } from '@/lib/tableSearch';

import { useDebouncedValue } from './useDebouncedValue';

type SearchRecord = Record<string, string | number | undefined>;

/** The `server` controls, minus the pieces that come from the query result. */
export type TableServerControls = Omit<
  DataTableServer,
  'pageCount' | 'isFetching'
>;

interface UseTableUrlStateOptions {
  defaultSort: SortState;
  /** URL keys that back the table's filter dropdowns (e.g. `['status']`). */
  filterKeys?: readonly string[];
  pageSize?: number;
}

interface UseTableUrlStateResult {
  params: ListParams;
  filterValues: Record<string, string | undefined>;
  controls: TableServerControls;
  /**
   * Set multiple filter keys atomically (e.g. a date range's `from`/`to`
   * together) — two sequential `controls.onFilterChange` calls would each
   * navigate off the same stale `prev` search snapshot and the first write
   * could get clobbered by the second.
   */
  setFilters: (patch: Record<string, string | undefined>) => void;
}

/**
 * Single source of truth for a server-driven table's page / search / sort /
 * filters, persisted in the route's URL search params (shareable + bookmarkable
 * + survives refresh). Returns `params` for the query hook and `controls` for
 * `<DataTable server={...} />`.
 */
export function useTableUrlState({
  defaultSort,
  filterKeys = [],
  pageSize = 10,
}: UseTableUrlStateOptions): UseTableUrlStateResult {
  const navigate = useNavigate();
  const search = useSearch({ strict: false }) as Record<string, unknown>;

  const urlPage =
    typeof search.page === 'number' && search.page > 1 ? search.page : 1;
  const urlQ = typeof search.q === 'string' ? search.q : '';
  const urlSort = typeof search.sort === 'string' ? search.sort : undefined;
  const sort = parseSort(urlSort) ?? defaultSort;

  const updateSearch = (patch: SearchRecord) => {
    navigate({
      to: '.',
      replace: true,
      search: (prev) => {
        const next: SearchRecord = { ...(prev as SearchRecord), ...patch };
        for (const key of Object.keys(next)) {
          if (next[key] === undefined || next[key] === '') delete next[key];
        }
        if (next.page === 1) delete next.page;
        return next;
      },
    });
  };

  // Search box: immediate local value, debounced write to the URL.
  const [searchInput, setSearchInput] = useState(urlQ);
  const lastPushed = useRef(urlQ);
  const debounced = useDebouncedValue(searchInput, 300);

  useEffect(() => {
    // Sync back only on external nav (back/forward), never our own push.
    if (urlQ !== lastPushed.current) setSearchInput(urlQ);
  }, [urlQ]);

  useEffect(() => {
    if (debounced !== urlQ) {
      lastPushed.current = debounced;
      updateSearch({ q: debounced || undefined, page: undefined });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debounced]);

  const filterValues: Record<string, string | undefined> = {};
  for (const key of filterKeys) {
    const value = search[key];
    filterValues[key] = typeof value === 'string' && value ? value : undefined;
  }

  const sorting: SortingState = [{ id: sort.id, desc: sort.desc }];
  const onSortingChange: OnChangeFn<SortingState> = (updater) => {
    const nextState =
      typeof updater === 'function' ? updater(sorting) : updater;
    const first = nextState[0];
    updateSearch({
      sort: first ? serializeSort(first) : undefined,
      page: undefined,
    });
  };

  const setFilters = (patch: Record<string, string | undefined>) =>
    updateSearch({ ...patch, page: undefined });

  const controls: TableServerControls = {
    search: searchInput,
    onSearchChange: setSearchInput,
    filterValues,
    onFilterChange: (columnId, value) => setFilters({ [columnId]: value }),
    sorting,
    onSortingChange,
    pageIndex: urlPage - 1,
    onPageChange: (pageIndex) => updateSearch({ page: pageIndex + 1 }),
  };

  const params: ListParams = {
    page: urlPage - 1,
    pageSize,
    search: urlQ || undefined,
    sort,
  };

  return { params, filterValues, controls, setFilters };
}

import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { ChevronsUpDown, Loader2 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useDebouncedValue } from '@/hooks/useDebouncedValue';
import { cn } from '@/lib/utils';

import { useInfiniteProducts } from '../hooks/useProducts';
import type { ProductListItem } from '../types';

interface MultiProductComboboxProps {
  selectedIds: number[];
  /** Fires on every toggle — both selecting and deselecting a row. The
   *  caller decides what "selected" means (add vs. remove) by checking
   *  whether the id was already in `selectedIds`. */
  onToggle: (product: ProductListItem) => void;
  /** Rows not already selected are disabled once `selectedIds.length`
   *  reaches this — already-selected rows stay clickable so they can
   *  still be deselected at the cap. */
  maxSelected: number;
  className?: string;
}

const ROW_HEIGHT = 44;

/**
 * Search-as-you-type, stays open across multiple picks — unlike
 * `ProductCombobox` (single pick, closes immediately), this is for
 * building up a bounded set (e.g. curating bestsellers).
 */
export function MultiProductCombobox({
  selectedIds,
  onToggle,
  maxSelected,
  className,
}: MultiProductComboboxProps) {
  const listId = useId();
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search, 300);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isPending,
    isFetching,
  } = useInfiniteProducts(debouncedSearch);

  const products = useMemo(
    () => data?.pages.flatMap((page) => page.rows) ?? [],
    [data],
  );

  const atLimit = selectedIds.length >= maxSelected;

  // State-backed ref: the scroll element lives inside the portaled popover and
  // only mounts on open, so a plain useRef wouldn't re-render the virtualizer
  // once it exists. Setting state on mount forces the re-measure.
  const [scrollEl, setScrollEl] = useState<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // One extra "loading more" sentinel row when further pages exist.
  const rowCount = hasNextPage ? products.length + 1 : products.length;

  const virtualizer = useVirtualizer({
    count: rowCount,
    getScrollElement: () => scrollEl,
    estimateSize: () => ROW_HEIGHT,
    overscan: 8,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // Fetch the next page as the sentinel row scrolls into view.
  useEffect(() => {
    const last = virtualItems[virtualItems.length - 1];
    if (!last) return;
    if (last.index >= products.length && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [
    virtualItems,
    products.length,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  ]);

  // Jump back to the top whenever the search term changes.
  useEffect(() => {
    scrollEl?.scrollTo({ top: 0 });
  }, [debouncedSearch, scrollEl]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          className={cn(
            'border-input focus-visible:border-ring focus-visible:ring-ring/50 flex h-9 w-full items-center justify-between gap-2 rounded-lg border bg-transparent px-3 text-sm transition-colors outline-none focus-visible:ring-3',
            selectedIds.length === 0 && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">
            {selectedIds.length === 0
              ? 'Search products to add…'
              : `${selectedIds.length} of ${maxSelected} products selected`}
          </span>
          <ChevronsUpDown className="text-muted-foreground size-4 shrink-0" />
        </button>
      </PopoverTrigger>

      <PopoverContent
        align="start"
        className="w-(--radix-popover-trigger-width) p-0"
        onOpenAutoFocus={(e) => {
          e.preventDefault();
          inputRef.current?.focus();
        }}
      >
        <div className="border-border relative border-b p-2">
          <Input
            ref={inputRef}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="h-8"
          />
          {isFetching && !isPending && (
            <Loader2 className="text-muted-foreground absolute top-1/2 right-4 size-4 -translate-y-1/2 animate-spin" />
          )}
        </div>

        {atLimit && (
          <p className="text-muted-foreground border-border border-b px-3 py-1.5 text-xs">
            Maximum {maxSelected} reached — remove one to add another.
          </p>
        )}

        <div
          id={listId}
          ref={setScrollEl}
          className="max-h-64 overflow-y-auto overscroll-contain"
        >
          {isPending ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              Loading…
            </p>
          ) : products.length === 0 ? (
            <p className="text-muted-foreground py-6 text-center text-sm">
              No products found.
            </p>
          ) : (
            <div
              className="relative w-full"
              style={{ height: virtualizer.getTotalSize() }}
            >
              {virtualItems.map((virtualRow) => {
                const isSentinel = virtualRow.index >= products.length;
                const product = products[virtualRow.index];
                const isSelected = product && selectedIds.includes(product.id);
                const disabled = !isSelected && atLimit;
                return (
                  <div
                    key={virtualRow.key}
                    className="absolute top-0 left-0 w-full"
                    style={{
                      height: virtualRow.size,
                      transform: `translateY(${virtualRow.start}px)`,
                    }}
                  >
                    {isSentinel ? (
                      <div className="text-muted-foreground flex h-full items-center justify-center gap-2 text-sm">
                        <Loader2 className="size-4 animate-spin" />
                        Loading more…
                      </div>
                    ) : (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onToggle(product)}
                        className={cn(
                          'hover:bg-accent hover:text-accent-foreground flex h-full w-full items-center gap-3 px-3 text-left text-sm disabled:pointer-events-none disabled:opacity-40',
                          isSelected && 'bg-accent/50',
                        )}
                      >
                        <Checkbox
                          checked={isSelected}
                          disabled={disabled}
                          tabIndex={-1}
                          className="pointer-events-none"
                        />
                        <span className="truncate">{product.name}</span>
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

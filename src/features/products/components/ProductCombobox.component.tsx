import { useEffect, useMemo, useRef, useState } from 'react';

import { Check, ChevronsUpDown, Loader2 } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

import { Button } from '@/components/ui/button';
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

interface ProductComboboxProps {
  value: ProductListItem | null;
  onChange: (product: ProductListItem) => void;
  /** Products to hide from the results — e.g. ones already picked elsewhere
   *  in the surrounding form, so they can't be added twice. */
  excludeIds?: number[];
  className?: string;
}

const ROW_HEIGHT = 40;

export function ProductCombobox({
  value,
  onChange,
  excludeIds,
  className,
}: ProductComboboxProps) {
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

  const products = useMemo(() => {
    const rows = data?.pages.flatMap((page) => page.rows) ?? [];
    return excludeIds?.length
      ? rows.filter((p) => !excludeIds.includes(p.id))
      : rows;
  }, [data, excludeIds]);

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
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            'w-full justify-between font-normal',
            !value && 'text-muted-foreground',
            className,
          )}
        >
          <span className="truncate">
            {value ? value.name : 'Select product'}
          </span>
          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
        </Button>
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

        <div
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
                        onClick={() => {
                          onChange(product);
                          setOpen(false);
                        }}
                        className={cn(
                          'hover:bg-accent hover:text-accent-foreground flex h-full w-full items-center justify-between gap-2 px-3 text-left text-sm',
                          value?.id === product.id && 'bg-accent/50',
                        )}
                      >
                        <span className="truncate">{product.name}</span>
                        {value?.id === product.id && (
                          <Check className="size-4 shrink-0" />
                        )}
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

import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';

import { ArrowDown, ArrowUp, X } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

import { ProductCombobox } from './ProductCombobox.component';

import { useBestsellers, useSaveBestsellers } from '../hooks/useBestsellers';

/** The storefront homepage only ever shows this many — see getBestsellers()
 *  in the storefront repo. Kept in sync manually (cross-repo). */
export const STOREFRONT_BESTSELLER_LIMIT = 12;

interface DraftItem {
  id: number;
  name: string;
  is_active: boolean;
}

function arraysEqual(a: number[], b: number[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}

export interface BestsellersManagerHandle {
  save: () => void;
}

interface BestsellersManagerProps {
  onDirtyChange?: (isDirty: boolean) => void;
  onSavingChange?: (isSaving: boolean) => void;
}

export const BestsellersManager = forwardRef<
  BestsellersManagerHandle,
  BestsellersManagerProps
>(function BestsellersManager({ onDirtyChange, onSavingChange }, ref) {
  const { data: bestsellers, isPending } = useBestsellers();
  const saveMutation = useSaveBestsellers();

  const [draft, setDraft] = useState<DraftItem[] | null>(null);
  // Tracks which `bestsellers` reference the draft was last seeded from, so
  // it's seeded exactly once per fresh fetch — set alongside `draft` during
  // render (React's documented pattern for deriving state from a prop/query
  // result) rather than in an effect, and never while edits are unsaved
  // (`draft` only resets to null right after a successful save), so a
  // background refetch can't clobber in-progress work.
  const [syncedFrom, setSyncedFrom] = useState<typeof bestsellers>(undefined);

  if (bestsellers && draft === null && bestsellers !== syncedFrom) {
    setDraft(
      bestsellers.map((p) => ({
        id: p.id,
        name: p.name,
        is_active: p.is_active,
      })),
    );
    setSyncedFrom(bestsellers);
  }

  const originalIds = bestsellers?.map((p) => p.id) ?? [];
  const draftIds = draft?.map((p) => p.id) ?? [];
  const isDirty = draft !== null && !arraysEqual(originalIds, draftIds);

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useEffect(() => {
    onSavingChange?.(saveMutation.isPending);
  }, [saveMutation.isPending, onSavingChange]);

  useImperativeHandle(ref, () => ({
    save: () => {
      if (!draft) return;
      const removedIds = originalIds.filter((id) => !draftIds.includes(id));
      saveMutation.mutate(
        { orderedIds: draftIds, removedIds },
        { onSuccess: () => setDraft(null) },
      );
    },
  }));

  const move = (index: number, direction: -1 | 1) => {
    setDraft((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const target = index + direction;
      if (target < 0 || target >= next.length) return prev;
      [next[index], next[target]] = [next[target], next[index]];
      return next;
    });
  };

  const remove = (id: number) => {
    setDraft((prev) => prev?.filter((p) => p.id !== id) ?? prev);
  };

  const add = (product: { id: number; name: string; is_active: boolean }) => {
    setDraft((prev) => {
      const base = prev ?? [];
      if (base.some((p) => p.id === product.id)) return base;
      return [...base, product];
    });
  };

  const list = draft ?? [];

  return (
    <div className="flex flex-col gap-4">
      <ProductCombobox value={null} onChange={add} />

      {isPending && draft === null ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : list.length === 0 ? (
        <p className="text-muted-foreground text-sm">
          No bestsellers selected yet — search above to add one.
        </p>
      ) : (
        <div className="flex flex-col gap-1.5">
          {list.map((product, index) => {
            const overLimit = index >= STOREFRONT_BESTSELLER_LIMIT;
            return (
              <div
                key={product.id}
                className={cn(
                  'border-border flex items-center gap-2 rounded-md border p-2',
                  overLimit && 'opacity-60',
                )}
              >
                <span className="text-muted-foreground w-6 text-right text-sm tabular-nums">
                  {index + 1}
                </span>
                <div className="flex-1">
                  <p className="text-foreground text-sm font-medium">
                    {product.name}
                  </p>
                  {overLimit && (
                    <p className="text-muted-foreground text-xs">
                      Won&apos;t appear on the storefront — only the top{' '}
                      {STOREFRONT_BESTSELLER_LIMIT} show.
                    </p>
                  )}
                </div>
                {!product.is_active && (
                  <Badge variant="secondary">Inactive</Badge>
                )}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === 0}
                  onClick={() => move(index, -1)}
                >
                  <ArrowUp className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  disabled={index === list.length - 1}
                  onClick={() => move(index, 1)}
                >
                  <ArrowDown className="size-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="text-destructive"
                  onClick={() => remove(product.id)}
                >
                  <X className="size-4" />
                </Button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
});

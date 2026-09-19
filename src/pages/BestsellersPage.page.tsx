import { useRef, useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useBlocker } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  BestsellersManager,
  type BestsellersManagerHandle,
  STOREFRONT_BESTSELLER_LIMIT,
} from '@/features/products/components/BestsellersManager.component';

export function BestsellersPage() {
  const managerRef = useRef<BestsellersManagerHandle>(null);
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useBlocker({
    shouldBlockFn: () =>
      isDirty &&
      !window.confirm('You have unsaved changes. Leave without saving?'),
    enableBeforeUnload: isDirty,
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Bestsellers</h1>
          <p className="text-muted-foreground text-sm">
            Products featured in the storefront&apos;s Bestsellers section, in
            this order — only the top {STOREFRONT_BESTSELLER_LIMIT} are shown
            there. If none are selected, the storefront falls back to its
            regular catalog order (first {STOREFRONT_BESTSELLER_LIMIT} products
            alphabetically). Changes aren&apos;t applied until you save.
          </p>
        </div>
        <Button
          disabled={!isDirty || isSaving}
          onClick={() => managerRef.current?.save()}
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          Save changes
        </Button>
      </div>

      <BestsellersManager
        ref={managerRef}
        onDirtyChange={setIsDirty}
        onSavingChange={setIsSaving}
      />
    </div>
  );
}

import { BestsellersManager } from '@/features/products/components/BestsellersManager.component';

export function BestsellersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">Bestsellers</h1>
        <p className="text-muted-foreground text-sm">
          Curate which products show in the storefront&apos;s Bestsellers
          section, and in what order.
        </p>
      </div>

      <BestsellersManager />
    </div>
  );
}

import { Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import ProductsTable from '@/features/products/components/products-table';
import { useProducts } from '@/features/products/hooks/use-products';

export default function ProductsPage() {
  const { data, isPending } = useProducts();

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Products</h1>
          <p className="text-muted-foreground text-sm">
            Manage the catalog and variants.
          </p>
        </div>
        <Button asChild>
          <Link to="/products/new">
            <Plus className="size-4" />
            New product
          </Link>
        </Button>
      </div>

      <ProductsTable products={data ?? []} isLoading={isPending} />
    </div>
  );
}

import { useMemo } from 'react';

import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable, type DataTableFilter } from '@/components/app/DataTable';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import type { ProductListItem } from '../types';

interface ProductsTableProps {
  products: ProductListItem[];
  isLoading: boolean;
}

function formatPrice(products: ProductListItem) {
  const variants = products.product_variants;
  if (!variants.length) return '—';
  const defaultVariant = variants.find((v) => v.is_default) ?? variants[0];
  if (variants.length === 1) return `₹${defaultVariant.price}`;
  const prices = variants.map((v) => Number(v.price));
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  return min === max ? `₹${min}` : `₹${min}–${max}`;
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={cn(
        'border-transparent',
        isActive
          ? 'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300'
          : 'bg-secondary text-secondary-foreground',
      )}
    >
      {isActive ? 'Active' : 'Inactive'}
    </Badge>
  );
}

export function ProductsTable({ products, isLoading }: ProductsTableProps) {
  const navigate = useNavigate();

  const categoryOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const product of products) {
      if (product.categories) {
        seen.set(String(product.categories.id), product.categories.name);
      }
    }
    return Array.from(seen, ([value, label]) => ({ value, label }));
  }, [products]);

  const filters: DataTableFilter[] = [
    { columnId: 'category', label: 'Category', options: categoryOptions },
    {
      columnId: 'is_active',
      label: 'Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  const columns: ColumnDef<ProductListItem, unknown>[] = [
    { accessorKey: 'name', header: 'Name' },
    {
      id: 'category',
      header: 'Category',
      accessorFn: (row) =>
        row.categories ? String(row.categories.id) : 'none',
      cell: ({ row }) => row.original.categories?.name ?? '—',
      filterFn: 'equalsString',
    },
    {
      id: 'variants',
      header: 'Variants',
      enableSorting: false,
      cell: ({ row }) => row.original.product_variants.length,
    },
    {
      id: 'price',
      header: 'Price',
      enableSorting: false,
      cell: ({ row }) => formatPrice(row.original),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      filterFn: (row, columnId, filterValue) =>
        String(row.getValue(columnId)) === filterValue,
      cell: ({ row }) => <StatusBadge isActive={row.original.is_active} />,
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      isLoading={isLoading}
      emptyMessage="No products yet."
      searchPlaceholder="Search products…"
      filters={filters}
      onRowClick={(product) =>
        navigate({
          to: '/products/$productId',
          params: { productId: String(product.id) },
        })
      }
      renderMobileCard={(product) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-foreground font-medium">{product.name}</span>
            <StatusBadge isActive={product.is_active} />
          </div>
          <span className="text-muted-foreground text-xs">
            {product.categories?.name ?? 'Uncategorized'} ·{' '}
            {product.product_variants.length} variant
            {product.product_variants.length === 1 ? '' : 's'} ·{' '}
            {formatPrice(product)}
          </span>
        </div>
      )}
    />
  );
}

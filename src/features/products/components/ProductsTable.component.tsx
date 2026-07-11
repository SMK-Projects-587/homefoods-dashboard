import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable, type DataTableFilter } from '@/components/app/DataTable';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/features/categories';
import { useTableUrlState } from '@/hooks/useTableUrlState';
import { cn } from '@/lib/utils';

import { useProductsTable } from '../hooks/useProducts';
import type { ProductListItem } from '../types';

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

const columns: ColumnDef<ProductListItem, unknown>[] = [
  { accessorKey: 'name', header: 'Name' },
  {
    id: 'category',
    header: 'Category',
    enableSorting: false,
    cell: ({ row }) => row.original.categories?.name ?? '—',
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
    cell: ({ row }) => <StatusBadge isActive={row.original.is_active} />,
  },
];

export function ProductsTable() {
  const navigate = useNavigate();
  const { params, filterValues, controls } = useTableUrlState({
    defaultSort: { id: 'name', desc: false },
    filterKeys: ['category', 'active'],
  });
  const query = useProductsTable({
    ...params,
    categoryId: filterValues.category
      ? Number(filterValues.category)
      : undefined,
    isActive: filterValues.active ? filterValues.active === 'true' : undefined,
  });

  const { data: categories } = useCategories();
  const filters: DataTableFilter[] = [
    {
      columnId: 'category',
      label: 'Category',
      options: (categories ?? []).map((c) => ({
        value: String(c.id),
        label: c.name,
      })),
    },
    {
      columnId: 'active',
      label: 'Status',
      options: [
        { value: 'true', label: 'Active' },
        { value: 'false', label: 'Inactive' },
      ],
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={query.data?.rows ?? []}
      isLoading={query.isPending}
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
      server={{
        ...controls,
        pageCount: query.data?.pageCount ?? 1,
        isFetching: query.isFetching,
      }}
    />
  );
}

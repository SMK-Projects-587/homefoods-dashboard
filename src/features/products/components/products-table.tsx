import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

import DataTable from '@/components/data-table';
import { Badge } from '@/components/ui/badge';

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

export default function ProductsTable({
  products,
  isLoading,
}: ProductsTableProps) {
  const navigate = useNavigate();

  const columns: ColumnDef<ProductListItem, unknown>[] = [
    { accessorKey: 'name', header: 'Name' },
    {
      id: 'category',
      header: 'Category',
      cell: ({ row }) => row.original.categories?.name ?? '—',
    },
    {
      id: 'variants',
      header: 'Variants',
      cell: ({ row }) => row.original.product_variants.length,
    },
    {
      id: 'price',
      header: 'Price',
      cell: ({ row }) => formatPrice(row.original),
    },
    {
      accessorKey: 'is_active',
      header: 'Status',
      cell: ({ row }) => (
        <Badge variant={row.original.is_active ? 'default' : 'secondary'}>
          {row.original.is_active ? 'Active' : 'Inactive'}
        </Badge>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={products}
      isLoading={isLoading}
      emptyMessage="No products yet."
      onRowClick={(product) =>
        navigate({
          to: '/products/$productId',
          params: { productId: String(product.id) },
        })
      }
    />
  );
}

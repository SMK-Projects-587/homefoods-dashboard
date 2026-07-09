import { useState } from 'react';

import { MoreHorizontal, Plus } from 'lucide-react';
import type { ColumnDef } from '@tanstack/react-table';

import ConfirmDialog from '@/components/confirm-dialog';
import DataTable from '@/components/data-table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import VariantFormDialog from './variant-form-dialog';

import { useDeleteVariant } from '../hooks/use-product-variants';
import type { ProductVariant } from '../types';

interface VariantsSectionProps {
  productId: number;
  variants: ProductVariant[];
}

export default function VariantsSection({
  productId,
  variants,
}: VariantsSectionProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<ProductVariant | null>(
    null,
  );
  const [pendingDelete, setPendingDelete] = useState<ProductVariant | null>(
    null,
  );
  const deleteMutation = useDeleteVariant(productId);

  const columns: ColumnDef<ProductVariant, unknown>[] = [
    { accessorKey: 'title', header: 'Title' },
    { accessorKey: 'sku', header: 'SKU' },
    {
      accessorKey: 'price',
      header: 'Price',
      cell: ({ row }) => `₹${row.original.price}`,
    },
    { accessorKey: 'stock', header: 'Stock' },
    {
      id: 'flags',
      header: 'Status',
      cell: ({ row }) => (
        <div className="flex flex-wrap gap-1">
          {row.original.is_default && <Badge>Default</Badge>}
          {!row.original.is_active && (
            <Badge variant="secondary">Inactive</Badge>
          )}
          {!row.original.in_stock && (
            <Badge variant="outline">Out of stock</Badge>
          )}
        </div>
      ),
    },
    {
      id: 'actions',
      header: '',
      cell: ({ row }) => (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onSelect={() => {
                setEditingVariant(row.original);
                setDialogOpen(true);
              }}
            >
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
              variant="destructive"
              onSelect={() => setPendingDelete(row.original)}
            >
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      ),
    },
  ];

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Variants</CardTitle>
        <Button
          size="sm"
          onClick={() => {
            setEditingVariant(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          Add variant
        </Button>
      </CardHeader>
      <CardContent>
        <DataTable
          columns={columns}
          data={variants}
          emptyMessage="No variants yet — add at least one so this product can be sold."
        />
      </CardContent>

      <VariantFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        productId={productId}
        variant={editingVariant}
      />
      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete variant"
        description={`Delete "${pendingDelete?.title}"? This can't be undone.`}
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          pendingDelete &&
          deleteMutation.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          })
        }
      />
    </Card>
  );
}

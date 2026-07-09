import type { ColumnDef } from '@tanstack/react-table';

import DataTable from '@/components/data-table';

import type { Category } from '../types';

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
}

export default function CategoriesTable({
  categories,
  isLoading,
  onEdit,
}: CategoriesTableProps) {
  const columns: ColumnDef<Category, unknown>[] = [
    { accessorKey: 'name', header: 'Name' },
    { accessorKey: 'slug', header: 'Slug' },
    {
      accessorKey: 'description',
      header: 'Description',
      cell: ({ row }) => (
        <span className="text-muted-foreground line-clamp-1 max-w-64">
          {row.original.description || '—'}
        </span>
      ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={categories}
      isLoading={isLoading}
      emptyMessage="No categories yet."
      onRowClick={onEdit}
    />
  );
}

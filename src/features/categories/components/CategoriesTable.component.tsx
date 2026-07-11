import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/app/DataTable';

import type { Category } from '../types';

interface CategoriesTableProps {
  categories: Category[];
  isLoading: boolean;
  onEdit: (category: Category) => void;
}

export function CategoriesTable({
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
      enableSorting: false,
      cell: ({ row }) => (
        <span
          className="text-muted-foreground line-clamp-1 max-w-64"
          title={row.original.description || undefined}
        >
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
      searchPlaceholder="Search categories…"
      renderMobileCard={(category) => (
        <div className="flex flex-col gap-0.5">
          <span className="text-foreground font-medium">{category.name}</span>
          <span className="text-muted-foreground text-xs">{category.slug}</span>
          {category.description && (
            <span className="text-muted-foreground line-clamp-2 text-xs">
              {category.description}
            </span>
          )}
        </div>
      )}
    />
  );
}

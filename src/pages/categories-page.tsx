import { useState } from 'react';

import { Plus } from 'lucide-react';

import { Button } from '@/components/ui/button';
import CategoriesTable from '@/features/categories/components/categories-table';
import CategoryFormDialog from '@/features/categories/components/category-form-dialog';
import { useCategories } from '@/features/categories/hooks/use-categories';
import type { Category } from '@/features/categories/types';

export default function CategoriesPage() {
  const { data, isPending } = useCategories();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Categories</h1>
          <p className="text-muted-foreground text-sm">
            Organize products into categories.
          </p>
        </div>
        <Button
          onClick={() => {
            setEditingCategory(null);
            setDialogOpen(true);
          }}
        >
          <Plus className="size-4" />
          New category
        </Button>
      </div>

      <CategoriesTable
        categories={data ?? []}
        isLoading={isPending}
        onEdit={(category) => {
          setEditingCategory(category);
          setDialogOpen(true);
        }}
      />

      <CategoryFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        category={editingCategory}
      />
    </div>
  );
}

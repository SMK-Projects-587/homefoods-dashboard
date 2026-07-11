import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { createCategory, listCategories, updateCategory } from '../api';
import type { CategoryInsert, CategoryUpdate } from '../types';

export const categoriesKey = ['categories'] as const;

export function useCategories() {
  return useQuery({ queryKey: categoriesKey, queryFn: listCategories });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: CategoryInsert) => createCategory(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      toast.success('Category created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: CategoryUpdate }) =>
      updateCategory(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      toast.success('Category updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

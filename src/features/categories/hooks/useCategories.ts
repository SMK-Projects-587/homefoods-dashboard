import { toast } from 'sonner';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { ListParams } from '@/lib/pagination';

import {
  createCategory,
  listCategories,
  listCategoriesPage,
  updateCategory,
} from '../api';
import type { CategoryInsert, CategoryUpdate } from '../types';

export const categoriesKey = ['categories'] as const;
export const categoriesTableKey = (params: ListParams) =>
  ['categories', 'table', params] as const;

/** Full list — for dropdowns. */
export function useCategories() {
  return useQuery({ queryKey: categoriesKey, queryFn: listCategories });
}

/** Paginated list — for the categories table. */
export function useCategoriesTable(params: ListParams) {
  return useQuery({
    queryKey: categoriesTableKey(params),
    queryFn: () => listCategoriesPage(params),
    placeholderData: keepPreviousData,
  });
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

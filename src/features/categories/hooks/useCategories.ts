import { toast } from 'sonner';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { ListParams } from '@/lib/pagination';
import { buildImageKey, deleteImage, uploadImage } from '@/lib/storage';

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

// A category has a single image; upload stores the file and points image_path
// at it (empty string means "no image", since the column is non-nullable).
export function useUploadCategoryImage(categoryId: number, slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      file,
      previousPath,
    }: {
      file: File;
      previousPath: string;
    }) => {
      const key = buildImageKey('categories', slug, file);
      await uploadImage(key, file);
      const updated = await updateCategory(categoryId, { image_path: key });
      if (previousPath && previousPath !== key) {
        try {
          await deleteImage(previousPath);
        } catch {
          // Best-effort: leave the orphan rather than failing the upload.
        }
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      toast.success('Image uploaded');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useRemoveCategoryImage(categoryId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (imagePath: string) => {
      const updated = await updateCategory(categoryId, { image_path: '' });
      try {
        await deleteImage(imagePath);
      } catch {
        // Best-effort cleanup of the removed object.
      }
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: categoriesKey });
      toast.success('Image removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

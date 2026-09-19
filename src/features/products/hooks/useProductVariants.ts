import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { productKey } from './useProducts';

import { createVariant, updateVariant } from '../api';
import type { ProductVariantInsert, ProductVariantUpdate } from '../types';

export function useCreateVariant(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductVariantInsert) => createVariant(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKey(productId) });
      toast.success('Variant added');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateVariant(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, input }: { id: number; input: ProductVariantUpdate }) =>
      updateVariant(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKey(productId) });
      toast.success('Variant saved');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

/** Variants are never deleted (DB-enforced) — only deactivated via `is_active`. */
export function useSetVariantActive(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: number; isActive: boolean }) =>
      updateVariant(id, { is_active: isActive }),
    onSuccess: (_data, { isActive }) => {
      queryClient.invalidateQueries({ queryKey: productKey(productId) });
      toast.success(isActive ? 'Variant activated' : 'Variant deactivated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

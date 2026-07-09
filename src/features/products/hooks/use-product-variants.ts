import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { productKey } from './use-products';

import { createVariant, deleteVariant, updateVariant } from '../api';
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

export function useDeleteVariant(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteVariant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKey(productId) });
      toast.success('Variant removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

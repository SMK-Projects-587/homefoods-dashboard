import { toast } from 'sonner';
import { useMutation, useQueryClient } from '@tanstack/react-query';

import { buildImageKey, deleteImage, uploadImage } from '@/lib/storage';

import { productKey } from './useProducts';

import {
  createProductImage,
  deleteProductImage,
  setPrimaryImage,
} from '../api';

export function useUploadProductImage(productId: number, slug: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (file: File) => {
      const key = buildImageKey('products', slug, file);
      await uploadImage(key, file);
      return createProductImage({ product_id: productId, image_path: key });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKey(productId) });
      toast.success('Image uploaded');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useSetPrimaryImage(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => setPrimaryImage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKey(productId) });
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useDeleteProductImage(productId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({
      id,
      imagePath,
    }: {
      id: number;
      imagePath: string;
    }) => {
      await deleteProductImage(id);
      await deleteImage(imagePath);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productKey(productId) });
      toast.success('Image removed');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

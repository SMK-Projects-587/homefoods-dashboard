import { toast } from 'sonner';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createProduct,
  getProduct,
  listProducts,
  listProductsPage,
  type ListProductsParams,
  updateProduct,
} from '../api';
import type { ProductInsert, ProductUpdate } from '../types';

export const productsKey = ['products'] as const;
export const productsTableKey = (params: ListProductsParams) =>
  ['products', 'table', params] as const;
export const productKey = (id: number) => ['products', id] as const;

/** Full list — for the order product picker. */
export function useProducts() {
  return useQuery({ queryKey: productsKey, queryFn: listProducts });
}

/** Paginated list — for the products table. */
export function useProductsTable(params: ListProductsParams) {
  return useQuery({
    queryKey: productsTableKey(params),
    queryFn: () => listProductsPage(params),
    placeholderData: keepPreviousData,
  });
}

export function useProduct(id: number) {
  return useQuery({
    queryKey: productKey(id),
    queryFn: () => getProduct(id),
    enabled: Number.isFinite(id),
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductInsert) => createProduct(input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKey });
      toast.success('Product created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateProduct(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: ProductUpdate) => updateProduct(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: productsKey });
      queryClient.invalidateQueries({ queryKey: productKey(id) });
      toast.success('Product saved');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

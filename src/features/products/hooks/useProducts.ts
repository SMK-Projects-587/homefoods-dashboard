import { toast } from 'sonner';
import {
  keepPreviousData,
  useInfiniteQuery,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createProduct,
  getProduct,
  listProductsPage,
  type ListProductsParams,
  updateProduct,
} from '../api';
import type { ProductInsert, ProductUpdate } from '../types';

// Base key for cache invalidation; every products query is nested under it.
export const productsKey = ['products'] as const;
export const productsTableKey = (params: ListProductsParams) =>
  ['products', 'table', params] as const;
export const productsInfiniteKey = (search: string) =>
  ['products', 'infinite', search] as const;
export const productKey = (id: number) => ['products', id] as const;

const PICKER_PAGE_SIZE = 20;

/** Search-as-you-type, page-by-page products — for the order product picker. */
export function useInfiniteProducts(search: string) {
  return useInfiniteQuery({
    queryKey: productsInfiniteKey(search),
    queryFn: ({ pageParam }) =>
      listProductsPage({
        page: pageParam,
        pageSize: PICKER_PAGE_SIZE,
        search: search || undefined,
      }),
    initialPageParam: 0,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.reduce((sum, page) => sum + page.rows.length, 0);
      return loaded < lastPage.total ? allPages.length : undefined;
    },
    placeholderData: keepPreviousData,
  });
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

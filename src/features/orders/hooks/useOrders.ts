import { toast } from 'sonner';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import {
  createOrder,
  getOrder,
  listOrders,
  type ListOrdersParams,
  updateOrderStatus,
} from '../api';
import type { OrderInsert, OrderItemInsert, OrderStatus } from '../types';

export const ordersKey = ['orders'] as const;
export const ordersTableKey = (params: ListOrdersParams) =>
  ['orders', 'table', params] as const;
export const orderKey = (id: number) => ['orders', id] as const;

/** Paginated list — for the orders table. */
export function useOrdersTable(params: ListOrdersParams) {
  return useQuery({
    queryKey: ordersTableKey(params),
    queryFn: () => listOrders(params),
    placeholderData: keepPreviousData,
  });
}

export function useOrder(id: number) {
  return useQuery({
    queryKey: orderKey(id),
    queryFn: () => getOrder(id),
    enabled: Number.isFinite(id),
  });
}

export function useUpdateOrderStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: OrderStatus) => updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKey });
      queryClient.invalidateQueries({ queryKey: orderKey(id) });
      toast.success('Order status updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      order,
      items,
    }: {
      order: OrderInsert;
      items: Omit<OrderItemInsert, 'order_id'>[];
    }) => createOrder(order, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKey });
      toast.success('Order created');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

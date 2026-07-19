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
  getOrderStatusHistory,
  listOrders,
  type ListOrdersParams,
  updateOrder,
  updateOrderStatus,
  updatePaymentStatus,
} from '../api';
import type {
  OrderInsert,
  OrderItemInsert,
  OrderStatus,
  OrderUpdate,
  PaymentStatus,
} from '../types';

export const ordersKey = ['orders'] as const;
export const ordersTableKey = (params: ListOrdersParams) =>
  ['orders', 'table', params] as const;
export const orderKey = (id: number) => ['orders', id] as const;
export const orderStatusHistoryKey = (orderId: number) =>
  ['orders', orderId, 'status-history'] as const;

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

export function useOrderStatusHistory(orderId: number) {
  return useQuery({
    queryKey: orderStatusHistoryKey(orderId),
    queryFn: () => getOrderStatusHistory(orderId),
    enabled: Number.isFinite(orderId),
  });
}

export interface UpdateOrderStatusInput {
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  reason?: string | null;
  changedBy?: string | null;
}

export function useUpdateOrderStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: UpdateOrderStatusInput) =>
      updateOrderStatus({ id, ...input }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKey });
      queryClient.invalidateQueries({ queryKey: orderKey(id) });
      queryClient.invalidateQueries({ queryKey: orderStatusHistoryKey(id) });
      toast.success('Order status updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdatePaymentStatus(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (paymentStatus: PaymentStatus | null) =>
      updatePaymentStatus(id, paymentStatus),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKey });
      queryClient.invalidateQueries({ queryKey: orderKey(id) });
      toast.success('Payment status updated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

export function useUpdateOrder(id: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      order,
      items,
    }: {
      order: OrderUpdate;
      items: Omit<OrderItemInsert, 'order_id'>[];
    }) => updateOrder(id, order, items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ordersKey });
      queryClient.invalidateQueries({ queryKey: orderKey(id) });
      toast.success('Order updated');
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

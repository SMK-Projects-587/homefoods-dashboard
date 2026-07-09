import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getOrder, listOrders, updateOrderStatus } from '../api';
import type { OrderStatus } from '../types';

export const ordersKey = ['orders'] as const;
export const orderKey = (id: number) => ['orders', id] as const;

export function useOrders() {
  return useQuery({ queryKey: ordersKey, queryFn: listOrders });
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

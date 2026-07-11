import type { Tables, TablesInsert } from '@/types/database';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderItemInsert = TablesInsert<'order_items'>;

export interface OrderDetail extends Order {
  order_items: OrderItem[];
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'packed',
  'delivered',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

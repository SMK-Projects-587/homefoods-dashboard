import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type Order = Tables<'orders'>;
export type OrderItem = Tables<'order_items'>;
export type OrderInsert = TablesInsert<'orders'>;
export type OrderUpdate = TablesUpdate<'orders'>;
export type OrderItemInsert = TablesInsert<'order_items'>;
export type OrderStatusHistory = Tables<'order_status_history'>;
export type OrderStatusHistoryInsert = TablesInsert<'order_status_history'>;

export interface OrderDetail extends Order {
  order_items: OrderItem[];
}

/** Free-form jsonb snapshot — keys match the Django Address field names. */
export interface OrderShippingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
  country?: string;
}

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'completed',
  'cancelled',
] as const;

export type OrderStatus = (typeof ORDER_STATUSES)[number];

export const ORDER_STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
};

/**
 * Allowed `status` transitions — nothing outside this map is ever valid:
 * pending -> confirmed | cancelled, confirmed -> completed | cancelled.
 * No skipping (pending can't jump to completed), no reverting (confirmed
 * can't go back to pending). completed/cancelled are terminal: both map to
 * an empty list, so no further transition is ever offered or accepted.
 */
export const ORDER_STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/** Only `pending` orders may have their contents edited. */
export function isOrderEditable(status: string): boolean {
  return status === 'pending';
}

/** One period's slice of `dashboard_order_stats()` — see orders/api.ts. */
export interface OrderStatsPeriod {
  /** Non-cancelled orders (pending + confirmed + completed). */
  orderCount: number;
  /** Completed orders only — the count `revenue` is derived from. */
  completedCount: number;
  /** Sum of `total` for completed orders only (realized revenue). */
  revenue: number;
}

export interface OrderStats {
  lifetime: OrderStatsPeriod;
  thisMonth: OrderStatsPeriod;
  lastMonth: OrderStatsPeriod;
}

export const PAYMENT_STATUSES = ['unpaid', 'paid', 'refunded'] as const;

export type PaymentStatus = (typeof PAYMENT_STATUSES)[number];

export const PAYMENT_STATUS_LABEL: Record<PaymentStatus, string> = {
  unpaid: 'Unpaid',
  paid: 'Paid',
  refunded: 'Refunded',
};

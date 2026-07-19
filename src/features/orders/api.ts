import {
  type ListParams,
  type Paginated,
  rangeFor,
  resolveSort,
  sanitizeSearch,
  toPaginated,
} from '@/lib/pagination';
import { supabase } from '@/lib/supabase';

import {
  type Order,
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TRANSITIONS,
  type OrderDetail,
  type OrderInsert,
  type OrderItemInsert,
  type OrderStatus,
  type OrderStatusHistory,
  type OrderUpdate,
  type PaymentStatus,
} from './types';

export interface ListOrdersParams extends ListParams {
  status?: OrderStatus;
  /** ISO `YYYY-MM-DD`, inclusive — orders created on or after this date. */
  dateFrom?: string;
  /** ISO `YYYY-MM-DD`, inclusive — orders created on or before this date. */
  dateTo?: string;
}

const ORDER_SORT_COLUMNS = [
  'order_number',
  'customer_name',
  'status',
  'total',
  'created_at',
] as const;

/** Server-side filtered/sorted/paginated list — for the orders table. */
export async function listOrders(
  params: ListOrdersParams,
): Promise<Paginated<Order>> {
  const { page, pageSize, search, sort, status, dateFrom, dateTo } = params;
  let query = supabase.from('orders').select('*', { count: 'exact' });

  const term = sanitizeSearch(search);
  if (term) {
    query = query.or(
      `order_number.ilike.%${term}%,customer_name.ilike.%${term}%`,
    );
  }
  if (status) query = query.eq('status', status);
  if (dateFrom) query = query.gte('created_at', dateFrom);
  if (dateTo) {
    // Exclusive upper bound on the *next* day — created_at is a timestamp,
    // so a plain `.lte('created_at', dateTo)` would only match midnight of
    // that day and exclude every order actually placed on it.
    const exclusiveEnd = new Date(dateTo);
    exclusiveEnd.setUTCDate(exclusiveEnd.getUTCDate() + 1);
    query = query.lt('created_at', exclusiveEnd.toISOString().slice(0, 10));
  }

  const s = resolveSort(sort, ORDER_SORT_COLUMNS, {
    id: 'created_at',
    desc: true,
  });
  query = query.order(s.id, { ascending: !s.desc });

  const [from, to] = rangeFor(page, pageSize);
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return toPaginated(data, count, pageSize);
}

export async function getOrder(id: number): Promise<OrderDetail> {
  const { data, error } = await supabase
    .from('orders')
    .select('*, order_items(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as OrderDetail;
}

export interface UpdateOrderStatusParams {
  id: number;
  fromStatus: OrderStatus;
  toStatus: OrderStatus;
  /** Required (and only used) for `toStatus === 'cancelled'`. */
  reason?: string | null;
}

/**
 * Transitions `orders.status` and writes a matching `order_status_history`
 * row atomically, via the `update_order_status` Postgres function (see
 * supabase/migrations/20260719130000_atomic_order_status_history.sql in the
 * homefoods schema repo) — one RPC call/transaction, so a history row can
 * never go missing because a second client-side write failed. `changed_by`
 * is derived server-side from the caller's auth session (`auth.uid()`), not
 * passed by the client. Validates the transition against
 * `ORDER_STATUS_TRANSITIONS` before calling it — defense in depth on top of
 * the UI only ever offering valid actions (see
 * `OrderStatusActions.component.tsx`).
 */
export async function updateOrderStatus({
  id,
  fromStatus,
  toStatus,
  reason,
}: UpdateOrderStatusParams): Promise<Order> {
  if (!ORDER_STATUS_TRANSITIONS[fromStatus].includes(toStatus)) {
    throw new Error(
      `Cannot change status from "${ORDER_STATUS_LABEL[fromStatus]}" to "${ORDER_STATUS_LABEL[toStatus]}".`,
    );
  }
  if (toStatus === 'cancelled' && !reason?.trim()) {
    throw new Error('A reason is required to cancel an order.');
  }

  const { data, error } = await supabase.rpc('update_order_status', {
    p_order_id: id,
    p_from_status: fromStatus,
    p_to_status: toStatus,
    p_reason: toStatus === 'cancelled' ? reason?.trim() : undefined,
  });
  if (error) throw error;
  return data as Order;
}

export async function getOrderStatusHistory(
  orderId: number,
): Promise<OrderStatusHistory[]> {
  const { data, error } = await supabase
    .from('order_status_history')
    .select('*')
    .eq('order_id', orderId)
    .order('created_at', { ascending: true });
  if (error) throw error;
  return data;
}

/** Independent of status — never gated by the transition rules above. */
export async function updatePaymentStatus(
  id: number,
  paymentStatus: PaymentStatus | null,
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ payment_status: paymentStatus })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Full-content update for `pending` orders (customer/address/notes/items).
 * `OrderEditPage.page.tsx` only ever reaches this while `order.status` reads
 * as `pending`, but `.eq('status', 'pending')` re-checks it here too — if
 * the order was confirmed/cancelled by someone else in the meantime, this
 * matches zero rows and .single() throws instead of silently editing a
 * no-longer-pending order.
 */
export async function updateOrder(
  id: number,
  order: OrderUpdate,
  items: Omit<OrderItemInsert, 'order_id'>[],
): Promise<OrderDetail> {
  const { data: updated, error } = await supabase
    .from('orders')
    .update(order)
    .eq('id', id)
    .eq('status', 'pending')
    .select()
    .single();
  if (error) throw error;

  const { error: deleteError } = await supabase
    .from('order_items')
    .delete()
    .eq('order_id', id);
  if (deleteError) throw deleteError;

  const { data: insertedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(items.map((item) => ({ ...item, order_id: id })))
    .select();
  if (itemsError) throw itemsError;

  return { ...updated, order_items: insertedItems };
}

export async function createOrder(
  order: OrderInsert,
  items: Omit<OrderItemInsert, 'order_id'>[],
): Promise<OrderDetail> {
  const { data: created, error } = await supabase
    .from('orders')
    .insert(order)
    .select()
    .single();
  if (error) throw error;

  const { data: insertedItems, error: itemsError } = await supabase
    .from('order_items')
    .insert(items.map((item) => ({ ...item, order_id: created.id })))
    .select();
  if (itemsError) throw itemsError;

  return { ...created, order_items: insertedItems };
}

import {
  type ListParams,
  type Paginated,
  rangeFor,
  resolveSort,
  sanitizeSearch,
  toPaginated,
} from '@/lib/pagination';
import { supabase } from '@/lib/supabase';

import type {
  Order,
  OrderDetail,
  OrderInsert,
  OrderItemInsert,
  OrderStatus,
} from './types';

export interface ListOrdersParams extends ListParams {
  status?: OrderStatus;
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
  const { page, pageSize, search, sort, status } = params;
  let query = supabase.from('orders').select('*', { count: 'exact' });

  const term = sanitizeSearch(search);
  if (term) {
    query = query.or(
      `order_number.ilike.%${term}%,customer_name.ilike.%${term}%`,
    );
  }
  if (status) query = query.eq('status', status);

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

export async function updateOrderStatus(
  id: number,
  status: OrderStatus,
): Promise<Order> {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
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

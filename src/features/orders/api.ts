import { supabase } from '@/lib/supabase';

import type {
  Order,
  OrderDetail,
  OrderInsert,
  OrderItemInsert,
  OrderStatus,
} from './types';

export async function listOrders(): Promise<Order[]> {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data;
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

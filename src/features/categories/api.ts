import { supabase } from '@/lib/supabase';

import type { Category, CategoryInsert, CategoryUpdate } from './types';

export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

export async function createCategory(input: CategoryInsert): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateCategory(
  id: number,
  input: CategoryUpdate,
): Promise<Category> {
  const { data, error } = await supabase
    .from('categories')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

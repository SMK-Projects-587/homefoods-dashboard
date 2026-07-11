import {
  type ListParams,
  type Paginated,
  rangeFor,
  resolveSort,
  sanitizeSearch,
  toPaginated,
} from '@/lib/pagination';
import { supabase } from '@/lib/supabase';

import type { Category, CategoryInsert, CategoryUpdate } from './types';

const CATEGORY_SORT_COLUMNS = ['name', 'slug'] as const;

/** Full, unpaginated list — for dropdowns (category pickers/filters). */
export async function listCategories(): Promise<Category[]> {
  const { data, error } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  if (error) throw error;
  return data;
}

/** Server-side filtered/sorted/paginated list — for the categories table. */
export async function listCategoriesPage(
  params: ListParams,
): Promise<Paginated<Category>> {
  const { page, pageSize, search, sort } = params;
  let query = supabase.from('categories').select('*', { count: 'exact' });

  const term = sanitizeSearch(search);
  if (term) query = query.or(`name.ilike.%${term}%,slug.ilike.%${term}%`);

  const s = resolveSort(sort, CATEGORY_SORT_COLUMNS, {
    id: 'name',
    desc: false,
  });
  query = query.order(s.id, { ascending: !s.desc });

  const [from, to] = rangeFor(page, pageSize);
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return toPaginated(data, count, pageSize);
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

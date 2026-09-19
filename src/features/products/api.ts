import {
  type ListParams,
  type Paginated,
  rangeFor,
  resolveSort,
  toPaginated,
} from '@/lib/pagination';
import { supabase } from '@/lib/supabase';

import type {
  Product,
  ProductDetail,
  ProductImage,
  ProductImageInsert,
  ProductInsert,
  ProductListItem,
  ProductUpdate,
  ProductVariant,
  ProductVariantInsert,
  ProductVariantUpdate,
  VariantBySku,
} from './types';

export interface ListProductsParams extends ListParams {
  categoryId?: number;
  isActive?: boolean;
}

const PRODUCT_LIST_SELECT =
  '*, categories(id, name), product_variants(id, title, sku, price, is_default, is_active, in_stock)';
const PRODUCT_SORT_COLUMNS = ['name', 'is_active'] as const;

/** Server-side filtered/sorted/paginated list — for the products table and picker. */
export async function listProductsPage(
  params: ListProductsParams,
): Promise<Paginated<ProductListItem>> {
  const { page, pageSize, search, sort, categoryId, isActive } = params;
  let query = supabase
    .from('products')
    .select(PRODUCT_LIST_SELECT, { count: 'exact' });

  const term = search?.trim();
  if (term) query = query.ilike('name', `%${term}%`);
  if (categoryId != null) query = query.eq('category_id', categoryId);
  if (isActive != null) query = query.eq('is_active', isActive);

  const s = resolveSort(sort, PRODUCT_SORT_COLUMNS, {
    id: 'name',
    desc: false,
  });
  query = query.order(s.id, { ascending: !s.desc });

  const [from, to] = rangeFor(page, pageSize);
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return toPaginated(data as ProductListItem[], count, pageSize);
}

export async function getProduct(id: number): Promise<ProductDetail> {
  const { data, error } = await supabase
    .from('products')
    .select('*, categories(id, name), product_variants(*), product_images(*)')
    .eq('id', id)
    .single();
  if (error) throw error;
  return data as ProductDetail;
}

export async function getVariantsBySkus(
  skus: string[],
): Promise<VariantBySku[]> {
  if (skus.length === 0) return [];
  const { data, error } = await supabase
    .from('product_variants')
    .select('id, sku, title, price, products(id, name)')
    .in('sku', skus);
  if (error) throw error;
  return data as VariantBySku[];
}

export async function createProduct(input: ProductInsert): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updateProduct(
  id: number,
  input: ProductUpdate,
): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/** `product_variants_product_title_key` — one title per product (23505 on violation). */
function friendlyVariantError(error: {
  code?: string;
  message: string;
}): Error {
  if (error.code === '23505') {
    return new Error('This product already has a variant with that title.');
  }
  return new Error(error.message);
}

export async function createVariant(
  input: ProductVariantInsert,
): Promise<ProductVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .insert(input)
    .select()
    .single();
  if (error) throw friendlyVariantError(error);
  return data;
}

export async function updateVariant(
  id: number,
  input: ProductVariantUpdate,
): Promise<ProductVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .update(input)
    .eq('id', id)
    .select()
    .single();
  if (error) throw friendlyVariantError(error);
  return data;
}

export async function createProductImage(
  input: ProductImageInsert,
): Promise<ProductImage> {
  const { data, error } = await supabase
    .from('product_images')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
  return data;
}

// A DB trigger (product_images_demote_old_primary) auto-demotes the
// product's existing primary image, so this only needs to set the new one.
export async function setPrimaryImage(id: number): Promise<void> {
  const { error } = await supabase
    .from('product_images')
    .update({ is_primary: true })
    .eq('id', id);
  if (error) throw error;
}

export async function deleteProductImage(id: number): Promise<void> {
  const { error } = await supabase.from('product_images').delete().eq('id', id);
  if (error) throw error;
}

/** Curated bestsellers, ranked — the storefront falls back to the regular
 *  (alphabetical) catalog order for its top-N section when this is empty. */
export async function getBestsellers(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .eq('is_bestseller', true)
    .order('bestseller_rank', { ascending: true, nullsFirst: false })
    .order('name', { ascending: true });
  if (error) throw error;
  return data;
}

/**
 * Writes the whole edited bestseller list in one go — the dashboard's picker
 * is edit-then-Save, not save-per-click, so additions/removals/reordering
 * all land here together. `orderedIds` becomes the new ranking (index + 1);
 * `removedIds` are products that were bestsellers before this save and no
 * longer are.
 */
export async function saveBestsellers(
  orderedIds: number[],
  removedIds: number[],
): Promise<void> {
  const updates = [
    ...orderedIds.map((id, index) =>
      supabase
        .from('products')
        .update({ is_bestseller: true, bestseller_rank: index + 1 })
        .eq('id', id),
    ),
    ...removedIds.map((id) =>
      supabase
        .from('products')
        .update({ is_bestseller: false, bestseller_rank: null })
        .eq('id', id),
    ),
  ];
  const results = await Promise.all(updates);
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

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
} from './types';

export async function listProducts(): Promise<ProductListItem[]> {
  const { data, error } = await supabase
    .from('products')
    .select(
      '*, categories(id, name), product_variants(id, title, sku, price, is_default, is_active, in_stock, attributes)',
    )
    .order('name');
  if (error) throw error;
  return data as ProductListItem[];
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

export async function createVariant(
  input: ProductVariantInsert,
): Promise<ProductVariant> {
  const { data, error } = await supabase
    .from('product_variants')
    .insert(input)
    .select()
    .single();
  if (error) throw error;
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
  if (error) throw error;
  return data;
}

export async function deleteVariant(id: number): Promise<void> {
  const { error } = await supabase
    .from('product_variants')
    .delete()
    .eq('id', id);
  if (error) throw error;
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

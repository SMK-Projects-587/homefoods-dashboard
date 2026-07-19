import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type Product = Tables<'products'>;
export type ProductInsert = TablesInsert<'products'>;
export type ProductUpdate = TablesUpdate<'products'>;

export type ProductVariant = Tables<'product_variants'>;
export type ProductVariantInsert = TablesInsert<'product_variants'>;
export type ProductVariantUpdate = TablesUpdate<'product_variants'>;

export type ProductImage = Tables<'product_images'>;
export type ProductImageInsert = TablesInsert<'product_images'>;

export interface ProductListItem extends Product {
  categories: { id: number; name: string } | null;
  product_variants: Pick<
    ProductVariant,
    | 'id'
    | 'title'
    | 'sku'
    | 'price'
    | 'is_default'
    | 'is_active'
    | 'in_stock'
    | 'attributes'
  >[];
}

export interface VariantBySku extends Pick<
  ProductVariant,
  'id' | 'sku' | 'title' | 'price' | 'attributes'
> {
  products: { id: number; name: string } | null;
}

export interface ProductDetail extends Product {
  categories: { id: number; name: string } | null;
  product_variants: ProductVariant[];
  product_images: ProductImage[];
}

import type { Tables, TablesInsert, TablesUpdate } from '@/types/database';

export type Category = Tables<'categories'>;
export type CategoryInsert = TablesInsert<'categories'>;
export type CategoryUpdate = TablesUpdate<'categories'>;

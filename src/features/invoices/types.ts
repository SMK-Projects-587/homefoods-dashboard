import type { Tables } from '@/types/database';

export type Invoice = Tables<'invoices'>;

export interface InvoiceListItem extends Invoice {
  orders: { order_number: string } | null;
}

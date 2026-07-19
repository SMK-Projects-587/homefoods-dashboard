import { FunctionsHttpError } from '@supabase/supabase-js';

import {
  type ListParams,
  type Paginated,
  rangeFor,
  resolveSort,
  sanitizeSearch,
  toPaginated,
} from '@/lib/pagination';
import { supabase } from '@/lib/supabase';

import type { Invoice, InvoiceListItem } from './types';

const INVOICE_SORT_COLUMNS = [
  'invoice_number',
  'billing_name',
  'total',
  'issued_at',
] as const;

/** Server-side filtered/sorted/paginated list — for the invoices table. */
export async function listInvoices(
  params: ListParams,
): Promise<Paginated<InvoiceListItem>> {
  const { page, pageSize, search, sort } = params;
  let query = supabase
    .from('invoices')
    .select('*, orders(order_number)', { count: 'exact' });

  const term = sanitizeSearch(search);
  if (term) {
    query = query.or(
      `invoice_number.ilike.%${term}%,billing_name.ilike.%${term}%`,
    );
  }

  const s = resolveSort(sort, INVOICE_SORT_COLUMNS, {
    id: 'issued_at',
    desc: true,
  });
  query = query.order(s.id, { ascending: !s.desc });

  const [from, to] = rangeFor(page, pageSize);
  const { data, error, count } = await query.range(from, to);
  if (error) throw error;
  return toPaginated(data as InvoiceListItem[], count, pageSize);
}

export async function getInvoiceByOrderId(
  orderId: number,
): Promise<Invoice | null> {
  const { data, error } = await supabase
    .from('invoices')
    .select('*')
    .eq('order_id', orderId)
    .maybeSingle();
  if (error) throw error;
  return data;
}

interface GenerateInvoiceResult {
  invoice_id: number;
  invoice_number: string;
  bucket: 'invoices';
  key: string;
  status: string;
}

async function extractFunctionErrorMessage(error: unknown): Promise<string> {
  if (error instanceof FunctionsHttpError) {
    try {
      const body = await error.context.json();
      if (typeof body?.error === 'string') return body.error;
    } catch {
      // Response body wasn't JSON (or already consumed) — fall through.
    }
  }
  return error instanceof Error ? error.message : 'Failed to generate invoice';
}

/**
 * Calls the `generate-invoice` edge function: atomically snapshots the order
 * into an `invoices` row (FY-sequential number, via the `issue_invoice`
 * Postgres function), renders the PDF, and uploads it. Only valid for
 * `confirmed`/`completed` orders, and only once per order (`invoices.order_id`
 * is unique) — the function enforces both and returns a JSON error body on
 * rejection, which we surface here instead of a generic HTTP status message.
 * Safe to call again on a stuck prior attempt (invoice row exists, no
 * `pdf_key` yet) — the function resumes from the render/upload step.
 */
export async function generateInvoice(
  orderId: number,
): Promise<GenerateInvoiceResult> {
  const { data, error } =
    await supabase.functions.invoke<GenerateInvoiceResult>('generate-invoice', {
      body: { order_id: orderId },
    });
  if (error) throw new Error(await extractFunctionErrorMessage(error));
  if (!data) throw new Error('generate-invoice returned no data');
  return data;
}

import { toast } from 'sonner';
import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';

import type { ListParams } from '@/lib/pagination';
import { getInvoiceDownloadUrl } from '@/lib/storage';

import { generateInvoice, getInvoiceByOrderId, listInvoices } from '../api';

export const invoiceKey = (orderId: number) =>
  ['invoices', 'order', orderId] as const;
export const invoicesTableKey = (params: ListParams) =>
  ['invoices', 'table', params] as const;

export function useInvoice(orderId: number) {
  return useQuery({
    queryKey: invoiceKey(orderId),
    queryFn: () => getInvoiceByOrderId(orderId),
    enabled: Number.isFinite(orderId),
  });
}

/** Paginated list — for the invoices table. */
export function useInvoicesTable(params: ListParams) {
  return useQuery({
    queryKey: invoicesTableKey(params),
    queryFn: () => listInvoices(params),
    placeholderData: keepPreviousData,
  });
}

export function useGenerateInvoice(orderId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => generateInvoice(orderId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: invoiceKey(orderId) });
      toast.success('Invoice generated');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

/** Fetches a signed download URL for an invoice PDF and opens it. */
export function useDownloadInvoice() {
  return useMutation({
    mutationFn: (key: string) => getInvoiceDownloadUrl(key),
    onSuccess: (url) => {
      window.open(url, '_blank', 'noopener,noreferrer');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

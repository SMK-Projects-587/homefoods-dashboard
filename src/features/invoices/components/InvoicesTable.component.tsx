import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable } from '@/components/app/DataTable';
import { Badge } from '@/components/ui/badge';
import { useTableUrlState } from '@/hooks/useTableUrlState';
import { formatDate } from '@/lib/utils';

import { useInvoicesTable } from '../hooks/useInvoices';
import type { InvoiceListItem } from '../types';

const columns: ColumnDef<InvoiceListItem, unknown>[] = [
  { accessorKey: 'invoice_number', header: 'Invoice #' },
  {
    id: 'order',
    header: 'Order',
    enableSorting: false,
    cell: ({ row }) => row.original.orders?.order_number ?? '—',
  },
  { accessorKey: 'billing_name', header: 'Billed to' },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => `₹${row.original.total}`,
  },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => (
      <Badge variant="outline" className="capitalize">
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: 'issued_at',
    header: 'Issued',
    cell: ({ row }) =>
      row.original.issued_at ? formatDate(row.original.issued_at) : '—',
  },
];

/** Rows link to the order, not a dedicated invoice page — there isn't one. */
export function InvoicesTable() {
  const navigate = useNavigate();
  const { params, controls } = useTableUrlState({
    defaultSort: { id: 'issued_at', desc: true },
  });
  const query = useInvoicesTable(params);

  return (
    <DataTable
      columns={columns}
      data={query.data?.rows ?? []}
      isLoading={query.isPending}
      emptyMessage="No invoices yet."
      searchPlaceholder="Search invoices…"
      onRowClick={(invoice) => {
        navigate({
          to: '/orders/$orderId',
          params: { orderId: String(invoice.order_id) },
        });
      }}
      renderMobileCard={(invoice) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-foreground font-medium">
              {invoice.invoice_number}
            </span>
            <Badge variant="outline" className="capitalize">
              {invoice.status}
            </Badge>
          </div>
          <span className="text-muted-foreground text-xs">
            {invoice.billing_name} · ₹{invoice.total}
            {invoice.orders && ` · ${invoice.orders.order_number}`}
          </span>
          {invoice.issued_at && (
            <span className="text-muted-foreground text-xs">
              Issued {formatDate(invoice.issued_at)}
            </span>
          )}
        </div>
      )}
      server={{
        ...controls,
        pageCount: query.data?.pageCount ?? 1,
        isFetching: query.isFetching,
      }}
    />
  );
}

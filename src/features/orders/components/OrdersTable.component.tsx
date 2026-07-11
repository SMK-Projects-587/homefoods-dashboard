import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable, type DataTableFilter } from '@/components/app/DataTable';
import { useTableUrlState } from '@/hooks/useTableUrlState';

import { OrderStatusBadge } from './OrderStatusBadge.component';

import { useOrdersTable } from '../hooks/useOrders';
import {
  type Order,
  ORDER_STATUS_LABEL,
  ORDER_STATUSES,
  type OrderStatus,
} from '../types';

const STATUS_FILTER: DataTableFilter = {
  columnId: 'status',
  label: 'Status',
  options: ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL[status],
  })),
};

const columns: ColumnDef<Order, unknown>[] = [
  { accessorKey: 'order_number', header: 'Order' },
  { accessorKey: 'customer_name', header: 'Customer' },
  {
    accessorKey: 'status',
    header: 'Status',
    cell: ({ row }) => <OrderStatusBadge status={row.original.status} />,
  },
  {
    accessorKey: 'total',
    header: 'Total',
    cell: ({ row }) => `₹${row.original.total}`,
  },
  {
    accessorKey: 'created_at',
    header: 'Date',
    cell: ({ row }) =>
      new Date(row.original.created_at).toLocaleDateString('en-IN'),
  },
];

export function OrdersTable() {
  const navigate = useNavigate();
  const { params, filterValues, controls } = useTableUrlState({
    defaultSort: { id: 'created_at', desc: true },
    filterKeys: ['status'],
  });
  const query = useOrdersTable({
    ...params,
    status: filterValues.status as OrderStatus | undefined,
  });

  return (
    <DataTable
      columns={columns}
      data={query.data?.rows ?? []}
      isLoading={query.isPending}
      emptyMessage="No orders yet."
      searchPlaceholder="Search orders…"
      filters={[STATUS_FILTER]}
      onRowClick={(order) =>
        navigate({
          to: '/orders/$orderId',
          params: { orderId: String(order.id) },
        })
      }
      renderMobileCard={(order) => (
        <div className="flex flex-col gap-1">
          <div className="flex items-start justify-between gap-2">
            <span className="text-foreground font-medium">
              {order.order_number}
            </span>
            <OrderStatusBadge status={order.status} />
          </div>
          <span className="text-muted-foreground text-xs">
            {order.customer_name} · ₹{order.total} ·{' '}
            {new Date(order.created_at).toLocaleDateString('en-IN')}
          </span>
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

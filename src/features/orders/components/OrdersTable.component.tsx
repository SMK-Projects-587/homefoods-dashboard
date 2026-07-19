import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable, type DataTableFilter } from '@/components/app/DataTable';
import { useTableUrlState } from '@/hooks/useTableUrlState';
import { formatDate } from '@/lib/utils';

import { OrdersDateRangeFilter } from './OrdersDateRangeFilter.component';
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
    cell: ({ row }) => formatDate(row.original.created_at),
  },
];

export function OrdersTable() {
  const navigate = useNavigate();
  const { params, filterValues, controls, setFilters } = useTableUrlState({
    defaultSort: { id: 'created_at', desc: true },
    filterKeys: ['status', 'dateFrom', 'dateTo'],
  });
  const query = useOrdersTable({
    ...params,
    status: filterValues.status as OrderStatus | undefined,
    dateFrom: filterValues.dateFrom,
    dateTo: filterValues.dateTo,
  });

  return (
    <DataTable
      columns={columns}
      data={query.data?.rows ?? []}
      isLoading={query.isPending}
      emptyMessage="No orders yet."
      searchPlaceholder="Search orders…"
      filters={[STATUS_FILTER]}
      toolbarExtra={
        <OrdersDateRangeFilter
          dateFrom={filterValues.dateFrom}
          dateTo={filterValues.dateTo}
          onChange={(dateFrom, dateTo) => setFilters({ dateFrom, dateTo })}
        />
      }
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
            {formatDate(order.created_at)}
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

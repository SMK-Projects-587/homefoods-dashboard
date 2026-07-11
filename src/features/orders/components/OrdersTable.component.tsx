import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

import { DataTable, type DataTableFilter } from '@/components/app/DataTable';

import { OrderStatusBadge } from './OrderStatusBadge.component';

import { type Order, ORDER_STATUS_LABEL, ORDER_STATUSES } from '../types';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
}

const STATUS_FILTER: DataTableFilter = {
  columnId: 'status',
  label: 'Status',
  options: ORDER_STATUSES.map((status) => ({
    value: status,
    label: ORDER_STATUS_LABEL[status],
  })),
};

export function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const navigate = useNavigate();

  const columns: ColumnDef<Order, unknown>[] = [
    { accessorKey: 'order_number', header: 'Order' },
    { accessorKey: 'customer_name', header: 'Customer' },
    {
      accessorKey: 'status',
      header: 'Status',
      filterFn: 'equalsString',
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

  return (
    <DataTable
      columns={columns}
      data={orders}
      isLoading={isLoading}
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
    />
  );
}

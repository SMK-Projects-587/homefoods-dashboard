import { useNavigate } from '@tanstack/react-router';
import type { ColumnDef } from '@tanstack/react-table';

import DataTable from '@/components/data-table';

import OrderStatusBadge from './order-status-badge';

import type { Order } from '../types';

interface OrdersTableProps {
  orders: Order[];
  isLoading: boolean;
}

export default function OrdersTable({ orders, isLoading }: OrdersTableProps) {
  const navigate = useNavigate();

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

  return (
    <DataTable
      columns={columns}
      data={orders}
      isLoading={isLoading}
      emptyMessage="No orders yet."
      onRowClick={(order) =>
        navigate({
          to: '/orders/$orderId',
          params: { orderId: String(order.id) },
        })
      }
    />
  );
}

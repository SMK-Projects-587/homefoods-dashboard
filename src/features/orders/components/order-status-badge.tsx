import { Badge } from '@/components/ui/badge';

import type { OrderStatus } from '../types';

const STATUS_VARIANT: Record<
  OrderStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'secondary',
  confirmed: 'outline',
  packed: 'outline',
  delivered: 'default',
  cancelled: 'destructive',
};

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderStatusBadge({ status }: { status: string }) {
  const key = status as OrderStatus;
  return (
    <Badge variant={STATUS_VARIANT[key] ?? 'secondary'}>
      {STATUS_LABEL[key] ?? status}
    </Badge>
  );
}

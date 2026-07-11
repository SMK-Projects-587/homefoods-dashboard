import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

import { ORDER_STATUS_LABEL, type OrderStatus } from '../types';

const STATUS_CLASSNAME: Record<OrderStatus, string> = {
  pending: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
  confirmed: 'bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300',
  packed:
    'bg-violet-100 text-violet-800 dark:bg-violet-950 dark:text-violet-300',
  delivered:
    'bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300',
  cancelled: '',
};

export function OrderStatusBadge({ status }: { status: string }) {
  const key = status as OrderStatus;
  return (
    <Badge
      variant={key === 'cancelled' ? 'destructive' : 'outline'}
      className={cn('border-transparent', STATUS_CLASSNAME[key])}
    >
      {ORDER_STATUS_LABEL[key] ?? status}
    </Badge>
  );
}

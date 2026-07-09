import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useUpdateOrderStatus } from '../hooks/use-orders';
import { ORDER_STATUSES, type OrderStatus } from '../types';

const STATUS_LABEL: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  packed: 'Packed',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

export default function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: string;
}) {
  const mutation = useUpdateOrderStatus(orderId);

  return (
    <Select
      value={status}
      onValueChange={(value) => mutation.mutate(value as OrderStatus)}
      disabled={mutation.isPending}
    >
      <SelectTrigger className="w-40">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {ORDER_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

import { useState } from 'react';

import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useUpdateOrderStatus } from '../hooks/useOrders';
import { ORDER_STATUS_LABEL, ORDER_STATUSES, type OrderStatus } from '../types';

export function OrderStatusSelect({
  orderId,
  status,
}: {
  orderId: number;
  status: string;
}) {
  const mutation = useUpdateOrderStatus(orderId);
  const [pendingStatus, setPendingStatus] = useState<OrderStatus | null>(null);

  return (
    <>
      <Select
        value={status}
        onValueChange={(value) => setPendingStatus(value as OrderStatus)}
        disabled={mutation.isPending}
      >
        <SelectTrigger className="w-40">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ORDER_STATUSES.map((s) => (
            <SelectItem key={s} value={s}>
              {ORDER_STATUS_LABEL[s]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <ConfirmDialog
        open={pendingStatus !== null}
        onOpenChange={(open) => !open && setPendingStatus(null)}
        title="Change order status"
        description={
          pendingStatus
            ? `Change status from "${ORDER_STATUS_LABEL[status as OrderStatus] ?? status}" to "${ORDER_STATUS_LABEL[pendingStatus]}"?`
            : ''
        }
        confirmLabel="Change status"
        confirmVariant={
          pendingStatus === 'cancelled' ? 'destructive' : 'default'
        }
        isPending={mutation.isPending}
        onConfirm={() => {
          if (!pendingStatus) return;
          mutation.mutate(pendingStatus, {
            onSuccess: () => setPendingStatus(null),
          });
        }}
      />
    </>
  );
}

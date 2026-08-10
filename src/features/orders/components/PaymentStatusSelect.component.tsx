import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

import { useUpdatePaymentStatus } from '../hooks/useOrders';
import {
  PAYMENT_STATUS_LABEL,
  PAYMENT_STATUSES,
  type PaymentStatus,
} from '../types';

const UNSET = 'unset';

interface PaymentStatusSelectProps {
  orderId: number;
  paymentStatus: string | null;
  /** True once an invoice row exists for this order — invoicing requires
   *  `paid`, and an issued invoice is permanent, so payment status must stay
   *  locked at `paid` from then on rather than drift out from under it. */
  locked?: boolean;
  className?: string;
}

/**
 * Payment tracking is deliberately independent of the status workflow in
 * `OrderStatusActions`: no transition rules, always editable regardless of
 * the order's status (including completed/cancelled — e.g. marking a
 * completed order refunded later) — unless `locked` (see prop doc).
 */
export function PaymentStatusSelect({
  orderId,
  paymentStatus,
  locked,
  className,
}: PaymentStatusSelectProps) {
  const mutation = useUpdatePaymentStatus(orderId);

  return (
    <Select
      value={paymentStatus ?? UNSET}
      onValueChange={(next) =>
        mutation.mutate(next === UNSET ? null : (next as PaymentStatus))
      }
      disabled={mutation.isPending || locked}
    >
      <SelectTrigger className={cn('w-full sm:w-40', className)}>
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={UNSET}>Not set</SelectItem>
        {PAYMENT_STATUSES.map((s) => (
          <SelectItem key={s} value={s}>
            {PAYMENT_STATUS_LABEL[s]}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

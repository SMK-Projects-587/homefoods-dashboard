import { useState } from 'react';

import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/features/auth';
import { cn } from '@/lib/utils';

import { CancelOrderDialog } from './CancelOrderDialog.component';

import { useUpdateOrderStatus } from '../hooks/useOrders';
import {
  ORDER_STATUS_LABEL,
  ORDER_STATUS_TRANSITIONS,
  type OrderStatus,
} from '../types';

const ACTION_LABEL: Partial<Record<OrderStatus, string>> = {
  confirmed: 'Confirm',
  completed: 'Complete',
};

interface OrderStatusActionsProps {
  orderId: number;
  status: OrderStatus;
  className?: string;
}

/**
 * Replaces the old free-dropdown status select: only ever offers the
 * transitions valid from the order's *current* status
 * (`ORDER_STATUS_TRANSITIONS`), so an invalid transition can't even be
 * attempted from the UI. Renders nothing once the order reaches a terminal
 * status (completed/cancelled) — no further status action is ever valid.
 */
export function OrderStatusActions({
  orderId,
  status,
  className,
}: OrderStatusActionsProps) {
  const mutation = useUpdateOrderStatus(orderId);
  // order_status_history.changed_by is `uuid references auth.users(id)`
  // (see supabase/migrations/20260719120000_order_status_lifecycle.sql), so
  // only the auth user id — never the email — is a valid value here.
  const changedBy = useAuthStore((s) => s.session?.user?.id ?? null);
  const [confirmTarget, setConfirmTarget] = useState<OrderStatus | null>(null);
  const [cancelOpen, setCancelOpen] = useState(false);

  const nextStatuses = ORDER_STATUS_TRANSITIONS[status];
  if (nextStatuses.length === 0) return null;

  const runTransition = (toStatus: OrderStatus, reason: string | null) => {
    mutation.mutate(
      { fromStatus: status, toStatus, reason, changedBy },
      {
        onSuccess: () => {
          setConfirmTarget(null);
          setCancelOpen(false);
        },
      },
    );
  };

  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {nextStatuses.map((next) =>
        next === 'cancelled' ? (
          <Button
            key={next}
            type="button"
            variant="destructive"
            onClick={() => setCancelOpen(true)}
            disabled={mutation.isPending}
          >
            Cancel order
          </Button>
        ) : (
          <Button
            key={next}
            type="button"
            onClick={() => setConfirmTarget(next)}
            disabled={mutation.isPending}
          >
            {ACTION_LABEL[next]}
          </Button>
        ),
      )}

      <ConfirmDialog
        open={confirmTarget !== null}
        onOpenChange={(open) => !open && setConfirmTarget(null)}
        title={confirmTarget ? `${ACTION_LABEL[confirmTarget]} order?` : ''}
        description={
          confirmTarget
            ? `Mark this order as "${ORDER_STATUS_LABEL[confirmTarget]}"? This cannot be changed once done.`
            : ''
        }
        confirmLabel={confirmTarget ? ACTION_LABEL[confirmTarget] : 'Confirm'}
        confirmVariant="default"
        isPending={mutation.isPending}
        onConfirm={() => confirmTarget && runTransition(confirmTarget, null)}
      />

      <CancelOrderDialog
        open={cancelOpen}
        onOpenChange={setCancelOpen}
        isPending={mutation.isPending}
        onConfirm={(reason) => runTransition('cancelled', reason)}
      />
    </div>
  );
}

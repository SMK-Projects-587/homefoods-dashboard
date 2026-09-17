import { useState } from 'react';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface CancelOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isPending?: boolean;
  onConfirm: (reason: string) => void;
}

/**
 * Dedicated dialog for the `-> cancelled` transition: unlike Confirm/
 * Complete, cancelling requires a reason, so the generic `ConfirmDialog`
 * (a plain title/description, no input) doesn't fit — this is a small,
 * purpose-built alternative built from the same alert-dialog primitives.
 */
export function CancelOrderDialog({
  open,
  onOpenChange,
  isPending,
  onConfirm,
}: CancelOrderDialogProps) {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setReason('');
      setError('');
    }
    onOpenChange(next);
  };

  const handleConfirm = () => {
    if (reason.trim() === '') {
      setError('A reason is required to cancel this order.');
      return;
    }
    onConfirm(reason.trim());
  };

  return (
    <AlertDialog open={open} onOpenChange={handleOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Cancel order</AlertDialogTitle>
          <AlertDialogDescription>
            This cancels the order — it becomes permanent and the order can
            never be changed again afterward. Please provide a reason.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="flex flex-col gap-1.5 text-left">
          <Label htmlFor="cancel-order-reason">
            Reason <span className="text-destructive">*</span>
          </Label>
          <Textarea
            id="cancel-order-reason"
            rows={3}
            value={reason}
            onChange={(e) => {
              setReason(e.target.value);
              if (error) setError('');
            }}
            aria-invalid={!!error}
            disabled={isPending}
          />
          {error && <p className="text-destructive text-sm">{error}</p>}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Back</AlertDialogCancel>
          <AlertDialogAction
            variant="destructive"
            disabled={isPending}
            onClick={(event) => {
              event.preventDefault();
              handleConfirm();
            }}
          >
            Cancel order
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

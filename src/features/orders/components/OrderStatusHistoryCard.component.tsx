import { ArrowRight } from 'lucide-react';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { OrderStatusBadge } from './OrderStatusBadge.component';

import { useOrderStatusHistory } from '../hooks/useOrders';

interface OrderStatusHistoryCardProps {
  orderId: number;
}

/** Read-only view of the `order_status_history` audit trail (section 4). */
export function OrderStatusHistoryCard({
  orderId,
}: OrderStatusHistoryCardProps) {
  const { data } = useOrderStatusHistory(orderId);

  if (!data || data.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Status history</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 text-sm">
        {data.map((entry) => (
          <div key={entry.id} className="flex flex-col gap-1">
            <div className="flex flex-wrap items-center gap-1.5">
              {entry.from_status && (
                <>
                  <OrderStatusBadge status={entry.from_status} />
                  <ArrowRight className="text-muted-foreground size-3.5" />
                </>
              )}
              <OrderStatusBadge status={entry.to_status} />
            </div>
            {entry.reason && (
              <p className="text-muted-foreground">Reason: {entry.reason}</p>
            )}
            <p className="text-muted-foreground text-xs">
              {new Date(entry.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

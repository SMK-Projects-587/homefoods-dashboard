import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { useOrderStats } from '../hooks/useOrders';
import type { OrderStatsPeriod } from '../types';

const PERIODS: {
  key: 'lifetime' | 'thisMonth' | 'lastMonth';
  label: string;
}[] = [
  { key: 'lifetime', label: 'Lifetime' },
  { key: 'thisMonth', label: 'This month' },
  { key: 'lastMonth', label: 'Last month' },
];

function formatCurrency(value: number): string {
  return `₹${value.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <span className="text-muted-foreground text-sm">{label}</span>
      <span className="text-foreground font-medium">{value}</span>
    </div>
  );
}

function PeriodCard({
  label,
  stats,
}: {
  label: string;
  stats?: OrderStatsPeriod;
}) {
  const avgOrderValue =
    stats && stats.completedCount > 0
      ? stats.revenue / stats.completedCount
      : 0;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium">
          {label}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        <StatRow
          label="Orders"
          value={stats ? String(stats.orderCount) : '—'}
        />
        <StatRow
          label="Sales"
          value={stats ? formatCurrency(stats.revenue) : '—'}
        />
        <StatRow
          label="Avg order value"
          value={stats ? formatCurrency(avgOrderValue) : '—'}
        />
      </CardContent>
    </Card>
  );
}

/**
 * Backed by a single `dashboard_order_stats()` RPC call (see
 * `getOrderStats` in `orders/api.ts`) — one lightweight round trip for all
 * nine numbers, not a client-side scan over order rows.
 */
export function OrderStatsCards() {
  const { data, isPending, isError, error } = useOrderStats();

  return (
    <div className="flex flex-col gap-2">
      {isError && (
        <p className="text-destructive text-sm">
          Couldn&apos;t load sales stats: {error.message}
        </p>
      )}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {PERIODS.map(({ key, label }) => (
          <PeriodCard
            key={key}
            label={label}
            stats={isPending ? undefined : data?.[key]}
          />
        ))}
      </div>
    </div>
  );
}

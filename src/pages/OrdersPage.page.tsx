import { Plus } from 'lucide-react';
import { Link } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { OrdersTable } from '@/features/orders/components/OrdersTable.component';

export function OrdersPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-foreground text-xl font-semibold">Orders</h1>
          <p className="text-muted-foreground text-sm">
            Orders recorded manually by staff.
          </p>
        </div>
        <Button asChild>
          <Link to="/orders/new">
            <Plus className="size-4" />
            New order
          </Link>
        </Button>
      </div>

      <OrdersTable />
    </div>
  );
}

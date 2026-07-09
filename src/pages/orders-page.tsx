import OrdersTable from '@/features/orders/components/orders-table';
import { useOrders } from '@/features/orders/hooks/use-orders';

export default function OrdersPage() {
  const { data, isPending } = useOrders();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">Orders</h1>
        <p className="text-muted-foreground text-sm">
          Orders recorded manually by staff.
        </p>
      </div>

      <OrdersTable orders={data ?? []} isLoading={isPending} />
    </div>
  );
}

import { ListTree, Package, ShoppingCart } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Link } from '@tanstack/react-router';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { OrderStatsCards } from '@/features/orders';
import { supabase } from '@/lib/supabase';

async function fetchCounts() {
  const [categories, products, pendingOrders] = await Promise.all([
    supabase.from('categories').select('*', { count: 'exact', head: true }),
    supabase.from('products').select('*', { count: 'exact', head: true }),
    supabase
      .from('orders')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'pending'),
  ]);
  if (categories.error) throw categories.error;
  if (products.error) throw products.error;
  if (pendingOrders.error) throw pendingOrders.error;
  return {
    categories: categories.count ?? 0,
    products: products.count ?? 0,
    pendingOrders: pendingOrders.count ?? 0,
  };
}

const CARDS = [
  { key: 'categories', label: 'Categories', to: '/categories', icon: ListTree },
  { key: 'products', label: 'Products', to: '/products', icon: Package },
  {
    key: 'pendingOrders',
    label: 'Pending orders',
    to: '/orders',
    icon: ShoppingCart,
  },
] as const;

export function DashboardPage() {
  const { data, isPending } = useQuery({
    queryKey: ['dashboard-counts'],
    queryFn: fetchCounts,
  });

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-foreground text-xl font-semibold">Overview</h1>
        <p className="text-muted-foreground text-sm">
          A quick look at the catalog and orders.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {CARDS.map(({ key, label, to, icon: Icon }) => (
          <Link key={key} to={to}>
            <Card className="hover:border-primary/50 transition-colors">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-muted-foreground text-sm font-medium">
                  {label}
                </CardTitle>
                <Icon className="text-muted-foreground size-4" />
              </CardHeader>
              <CardContent>
                <p className="text-foreground text-2xl font-semibold">
                  {isPending ? '—' : data?.[key]}
                </p>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div>
        <h2 className="text-foreground text-lg font-semibold">Sales</h2>
        <p className="text-muted-foreground text-sm">
          Orders and revenue by period. Sales and average order value count
          completed orders only.
        </p>
      </div>
      <OrderStatsCards />
    </div>
  );
}

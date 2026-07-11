import { ArrowLeft } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { OrderStatusSelect } from '@/features/orders/components/OrderStatusSelect.component';
import { useOrder } from '@/features/orders/hooks/useOrders';

interface ShippingAddress {
  line1?: string;
  line2?: string;
  city?: string;
  state?: string;
  postal_code?: string;
}

export function OrderDetailPage() {
  const { orderId } = useParams({ strict: false });
  const id = orderId ? Number(orderId) : -1;
  const navigate = useNavigate();
  const { data: order, isPending } = useOrder(id);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) return null;

  const address = (order.shipping_address ?? {}) as ShippingAddress;
  const hasAddress = address.line1 || address.city;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate({ to: '/orders' })}
          >
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h1 className="text-foreground text-xl font-semibold">
              {order.order_number}
            </h1>
            <p className="text-muted-foreground text-sm">
              {new Date(order.created_at).toLocaleString('en-IN')}
            </p>
          </div>
        </div>
        <OrderStatusSelect orderId={order.id} status={order.status} />
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-1 text-sm">
            <p className="text-foreground font-medium">{order.customer_name}</p>
            {order.customer_phone && (
              <p className="text-muted-foreground">{order.customer_phone}</p>
            )}
            {order.customer_email && (
              <p className="text-muted-foreground">{order.customer_email}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Shipping address</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {hasAddress ? (
              <>
                {address.line1 && <p>{address.line1}</p>}
                {address.line2 && <p>{address.line2}</p>}
                <p>
                  {[address.city, address.state, address.postal_code]
                    .filter(Boolean)
                    .join(', ')}
                </p>
              </>
            ) : (
              <p>No address on file.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {order.notes && (
        <Card>
          <CardHeader>
            <CardTitle>Notes</CardTitle>
          </CardHeader>
          <CardContent className="text-muted-foreground text-sm">
            {order.notes}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="border-border overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>SKU</TableHead>
                  <TableHead>Unit price</TableHead>
                  <TableHead>Qty</TableHead>
                  <TableHead>Line total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {order.order_items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell className="whitespace-nowrap">
                      {item.product_name}
                      {item.variant_title && (
                        <span className="text-muted-foreground">
                          {' '}
                          — {item.variant_title}
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.sku}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      ₹{item.unit_price}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {item.quantity}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      ₹{item.line_total}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="mt-4 flex flex-col items-end gap-1 text-sm">
            <div className="flex w-full max-w-56 justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{order.subtotal}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex w-full max-w-56 justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>−₹{order.discount}</span>
              </div>
            )}
            {Number(order.shipping_fee) > 0 && (
              <div className="flex w-full max-w-56 justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{order.shipping_fee}</span>
              </div>
            )}
            {Number(order.tax) > 0 && (
              <div className="flex w-full max-w-56 justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>₹{order.tax}</span>
              </div>
            )}
            <div className="border-border text-foreground flex w-full max-w-56 justify-between border-t pt-1 font-medium">
              <span>Total</span>
              <span>₹{order.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

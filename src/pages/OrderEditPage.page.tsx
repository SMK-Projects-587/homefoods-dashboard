import { ArrowLeft, Loader2 } from 'lucide-react';
import { Link, useNavigate, useParams } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  ORDER_FORM_ID,
  OrderForm,
  type OrderFormValues,
} from '@/features/orders/components/OrderForm.component';
import { type OrderItemDraft } from '@/features/orders/components/OrderItemsEditor.component';
import { useOrder, useUpdateOrder } from '@/features/orders/hooks/useOrders';
import {
  isOrderEditable,
  ORDER_STATUS_LABEL,
  type OrderShippingAddress,
  type OrderStatus,
} from '@/features/orders/types';

export function OrderEditPage() {
  const { orderId } = useParams({ strict: false });
  const id = orderId ? Number(orderId) : -1;
  const navigate = useNavigate();
  const { data: order, isPending } = useOrder(id);
  const updateMutation = useUpdateOrder(id);

  if (isPending) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!order) return null;

  // Only `pending` orders are editable — everything about a confirmed order
  // (items, quantities, customer/address/notes) is frozen. Guard the edit UI
  // itself rather than only the submit handler: a non-pending order never
  // even renders the form here.
  if (!isOrderEditable(order.status)) {
    return (
      <div className="flex flex-col gap-4">
        <p className="text-muted-foreground text-sm">
          This order is &ldquo;
          {ORDER_STATUS_LABEL[order.status as OrderStatus] ?? order.status}
          &rdquo; and can no longer be edited.
        </p>
        <Button asChild variant="outline" className="w-fit">
          <Link to="/orders/$orderId" params={{ orderId: String(order.id) }}>
            <ArrowLeft className="size-4" />
            Back to order
          </Link>
        </Button>
      </div>
    );
  }

  const address = (order.shipping_address ?? {}) as OrderShippingAddress;

  const initialValues: Partial<OrderFormValues> = {
    customerName: order.customer_name,
    customerPhone: order.customer_phone,
    customerEmail: order.customer_email,
    line1: address.line1 ?? '',
    line2: address.line2 ?? '',
    city: address.city ?? '',
    state: address.state ?? '',
    postalCode: address.postal_code ?? '',
    country: address.country ?? 'India',
    notes: order.notes,
    discount: String(order.discount ?? 0),
    shippingFee: String(order.shipping_fee ?? 0),
  };

  const initialItems: OrderItemDraft[] = order.order_items.map((item) => ({
    variantId: item.variant_id,
    productName: item.product_name,
    variantTitle: item.variant_title,
    sku: item.sku,
    unitPrice: Number(item.unit_price),
    quantity: item.quantity,
  }));

  const handleSubmit = (values: OrderFormValues, items: OrderItemDraft[]) => {
    // Defense in depth: submit is only wired up while `order.status` reads
    // as `pending` above, but re-check here too in case of a stale render.
    if (!isOrderEditable(order.status)) return;

    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const discount = Number(values.discount) || 0;
    const shippingFee = Number(values.shippingFee) || 0;
    const total = Math.max(0, subtotal - discount + shippingFee);

    updateMutation.mutate(
      {
        order: {
          customer_name: values.customerName,
          customer_phone: values.customerPhone,
          customer_email: values.customerEmail,
          shipping_address: {
            line1: values.line1,
            line2: values.line2,
            city: values.city,
            state: values.state,
            postal_code: values.postalCode,
            country: values.country,
          },
          notes: values.notes,
          subtotal,
          discount,
          shipping_fee: shippingFee,
          total,
        },
        items: items.map((item) => ({
          variant_id: item.variantId,
          product_name: item.productName,
          variant_title: item.variantTitle,
          sku: item.sku,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          line_total: item.unitPrice * item.quantity,
        })),
      },
      {
        onSuccess: () => {
          navigate({
            to: '/orders/$orderId',
            params: { orderId: String(order.id) },
          });
        },
      },
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() =>
            navigate({
              to: '/orders/$orderId',
              params: { orderId: String(order.id) },
            })
          }
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-xl font-semibold">
            Edit order {order.order_number}
          </h1>
          <p className="text-muted-foreground truncate text-sm">
            Only pending orders can be edited.
          </p>
        </div>
        <Button
          type="submit"
          form={ORDER_FORM_ID}
          disabled={updateMutation.isPending}
        >
          {updateMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          Save changes
        </Button>
      </div>

      <OrderForm
        onSubmit={handleSubmit}
        initialItems={initialItems}
        initialValues={initialValues}
      />
    </div>
  );
}

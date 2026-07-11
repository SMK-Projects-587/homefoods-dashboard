import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  ORDER_FORM_ID,
  OrderForm,
  type OrderFormValues,
} from '@/features/orders/components/OrderForm.component';
import { type OrderItemDraft } from '@/features/orders/components/OrderItemsEditor.component';
import { useCreateOrder } from '@/features/orders/hooks/useOrders';
import type { Json } from '@/types/database';

export function OrderNewPage() {
  const navigate = useNavigate();
  const createMutation = useCreateOrder();

  const handleSubmit = (values: OrderFormValues, items: OrderItemDraft[]) => {
    const subtotal = items.reduce(
      (sum, item) => sum + item.unitPrice * item.quantity,
      0,
    );
    const discount = Number(values.discount) || 0;
    const shippingFee = Number(values.shippingFee) || 0;
    const total = Math.max(0, subtotal - discount + shippingFee);

    createMutation.mutate(
      {
        order: {
          order_number: '',
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
          tax: 0,
          total,
        },
        items: items.map((item) => ({
          variant_id: item.variantId,
          product_name: item.productName,
          variant_title: item.variantTitle,
          sku: item.sku,
          attributes: item.attributes as Json,
          unit_price: item.unitPrice,
          quantity: item.quantity,
          line_total: item.unitPrice * item.quantity,
        })),
      },
      {
        onSuccess: (order) => {
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
          onClick={() => navigate({ to: '/orders' })}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-xl font-semibold">
            New order
          </h1>
          <p className="text-muted-foreground truncate text-sm">
            Record an order taken by phone, WhatsApp, or in person.
          </p>
        </div>
        <Button
          type="submit"
          form={ORDER_FORM_ID}
          disabled={createMutation.isPending}
        >
          {createMutation.isPending && (
            <Loader2 className="size-4 animate-spin" />
          )}
          Create order
        </Button>
      </div>

      <OrderForm onSubmit={handleSubmit} />
    </div>
  );
}

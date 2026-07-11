import { useState } from 'react';
import { useForm } from 'react-hook-form';

import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

import {
  type OrderItemDraft,
  OrderItemsEditor,
} from './OrderItemsEditor.component';

export const ORDER_FORM_ID = 'order-form';

const orderFormSchema = z.object({
  customerName: z.string().min(1, 'Customer name is required'),
  customerPhone: z.string(),
  customerEmail: z
    .string()
    .refine(
      (v) => v === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
      'Invalid email address',
    ),
  line1: z.string(),
  line2: z.string(),
  city: z.string(),
  state: z.string(),
  postalCode: z.string(),
  country: z.string(),
  notes: z.string(),
  discount: z
    .string()
    .refine((v) => v === '' || Number(v) >= 0, 'Discount must be 0 or more'),
  shippingFee: z
    .string()
    .refine((v) => v === '' || Number(v) >= 0, 'Shipping must be 0 or more'),
});

export type OrderFormValues = z.infer<typeof orderFormSchema>;

interface OrderFormProps {
  onSubmit: (values: OrderFormValues, items: OrderItemDraft[]) => void;
}

export function OrderForm({ onSubmit }: OrderFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<OrderFormValues>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      customerName: '',
      customerPhone: '',
      customerEmail: '',
      line1: '',
      line2: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      notes: '',
      discount: '0',
      shippingFee: '0',
    },
  });

  const [items, setItems] = useState<OrderItemDraft[]>([]);
  const [itemsError, setItemsError] = useState('');

  const discount = Number(watch('discount')) || 0;
  const shippingFee = Number(watch('shippingFee')) || 0;
  const subtotal = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0,
  );
  const total = Math.max(0, subtotal - discount + shippingFee);

  const submit = handleSubmit((values) => {
    if (items.length === 0) {
      setItemsError('Add at least one item.');
      return;
    }
    setItemsError('');
    onSubmit(values, items);
  });

  return (
    <form
      id={ORDER_FORM_ID}
      onSubmit={submit}
      className="flex flex-col gap-6"
      noValidate
    >
      <Card>
        <CardHeader>
          <CardTitle>Customer</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="order-customer-name">Name</Label>
            <Input
              id="order-customer-name"
              aria-invalid={!!errors.customerName}
              {...register('customerName')}
            />
            {errors.customerName && (
              <p className="text-destructive text-sm">
                {errors.customerName.message}
              </p>
            )}
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-customer-phone">Phone</Label>
            <Input id="order-customer-phone" {...register('customerPhone')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-customer-email">Email</Label>
            <Input
              id="order-customer-email"
              type="email"
              aria-invalid={!!errors.customerEmail}
              {...register('customerEmail')}
            />
            {errors.customerEmail && (
              <p className="text-destructive text-sm">
                {errors.customerEmail.message}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Shipping address</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="order-line1">Address line 1</Label>
            <Input id="order-line1" {...register('line1')} />
          </div>
          <div className="flex flex-col gap-1.5 sm:col-span-2">
            <Label htmlFor="order-line2">Address line 2</Label>
            <Input id="order-line2" {...register('line2')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-city">City</Label>
            <Input id="order-city" {...register('city')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-state">State</Label>
            <Input id="order-state" {...register('state')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-postal-code">Postal code</Label>
            <Input id="order-postal-code" {...register('postalCode')} />
          </div>
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="order-country">Country</Label>
            <Input id="order-country" {...register('country')} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Items</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          <OrderItemsEditor
            items={items}
            onAdd={(item) => {
              setItems((prev) => [...prev, item]);
              setItemsError('');
            }}
            onRemove={(index) =>
              setItems((prev) => prev.filter((_, i) => i !== index))
            }
            onQuantityChange={(index, quantity) =>
              setItems((prev) =>
                prev.map((item, i) =>
                  i === index ? { ...item, quantity } : item,
                ),
              )
            }
          />
          {itemsError && (
            <p className="text-destructive text-sm">{itemsError}</p>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-discount">Discount (₹)</Label>
              <Input
                id="order-discount"
                type="number"
                step="0.01"
                min="0"
                {...register('discount')}
              />
              {errors.discount && (
                <p className="text-destructive text-sm">
                  {errors.discount.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="order-shipping-fee">Shipping (₹)</Label>
              <Input
                id="order-shipping-fee"
                type="number"
                step="0.01"
                min="0"
                {...register('shippingFee')}
              />
              {errors.shippingFee && (
                <p className="text-destructive text-sm">
                  {errors.shippingFee.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col items-end gap-1 text-sm">
            <div className="flex w-full max-w-56 justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>₹{subtotal.toFixed(2)}</span>
            </div>
            {discount > 0 && (
              <div className="flex w-full max-w-56 justify-between">
                <span className="text-muted-foreground">Discount</span>
                <span>−₹{discount.toFixed(2)}</span>
              </div>
            )}
            {shippingFee > 0 && (
              <div className="flex w-full max-w-56 justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>₹{shippingFee.toFixed(2)}</span>
              </div>
            )}
            <div className="border-border text-foreground flex w-full max-w-56 justify-between border-t pt-1 font-medium">
              <span>Total</span>
              <span>₹{total.toFixed(2)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <Textarea
            id="order-notes"
            rows={3}
            placeholder="Optional notes for this order"
            {...register('notes')}
          />
        </CardContent>
      </Card>
    </form>
  );
}

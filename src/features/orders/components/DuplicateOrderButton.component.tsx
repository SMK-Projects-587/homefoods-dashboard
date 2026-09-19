import { useState } from 'react';

import { Copy, Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { useLookupVariantsBySku } from '@/features/products';
import { cn } from '@/lib/utils';

import type { OrderItemDraft } from './OrderItemsEditor.component';

import { useOrderDraftStore } from '../store';
import type { OrderDetail, OrderShippingAddress } from '../types';

interface DuplicateOrderButtonProps {
  order: OrderDetail;
  className?: string;
}

/**
 * Visible on every order regardless of status (section 5). Creates a new
 * `pending` order pre-filled from this one: customer/address copied as-is,
 * line items copied by SKU but re-resolved against the *current* catalog
 * (name/title/price), not the original snapshot. Discount, shipping fee and
 * notes are intentionally NOT copied — they're one-off inputs specific to
 * how the original order was fulfilled, not "what the customer is
 * ordering".
 */
export function DuplicateOrderButton({
  order,
  className,
}: DuplicateOrderButtonProps) {
  const navigate = useNavigate();
  const lookupMutation = useLookupVariantsBySku();
  const [error, setError] = useState('');

  const handleDuplicate = () => {
    setError('');
    const skus = order.order_items.map((item) => item.sku);

    lookupMutation.mutate(skus, {
      onSuccess: (variants) => {
        const bySku = new Map(variants.map((v) => [v.sku, v]));
        const missing = skus.filter((sku) => !bySku.has(sku));
        if (missing.length > 0) {
          setError(
            `Some items no longer exist in the catalog — unknown SKU(s): ${missing.join(', ')}.`,
          );
          return;
        }

        const items: OrderItemDraft[] = order.order_items.map((item) => {
          const variant = bySku.get(item.sku)!;
          return {
            variantId: variant.id,
            productName: variant.products?.name ?? '',
            variantTitle: variant.title,
            sku: variant.sku,
            unitPrice: Number(variant.price),
            quantity: item.quantity,
          };
        });

        const address = (order.shipping_address ?? {}) as OrderShippingAddress;

        useOrderDraftStore.getState().setDraft({
          items,
          customer: {
            name: order.customer_name,
            phone: order.customer_phone,
            email: order.customer_email,
          },
          address: {
            line1: address.line1 ?? '',
            line2: address.line2 ?? '',
            city: address.city ?? '',
            state: address.state ?? '',
            postalCode: address.postal_code ?? '',
            country: address.country ?? 'India',
          },
        });
        navigate({ to: '/orders/new' });
      },
      onError: (err) => setError(err.message),
    });
  };

  return (
    <div className={cn('flex flex-col items-start gap-1', className)}>
      <Button
        type="button"
        variant="outline"
        onClick={handleDuplicate}
        disabled={lookupMutation.isPending}
      >
        {lookupMutation.isPending ? (
          <Loader2 className="size-4 animate-spin" />
        ) : (
          <Copy className="size-4" />
        )}
        Duplicate order
      </Button>
      {error && <p className="text-destructive text-sm">{error}</p>}
    </div>
  );
}

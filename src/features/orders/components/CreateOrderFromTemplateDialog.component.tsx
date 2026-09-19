import { useState } from 'react';

import { Loader2 } from 'lucide-react';
import { useNavigate } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useLookupVariantsBySku } from '@/features/products';

import type { OrderItemDraft } from './OrderItemsEditor.component';

import { useOrderDraftStore } from '../store';
import { parseOrderTemplate } from '../templateParser';

const PLACEHOLDER = `-----
Name: Avakaya
Qty: 2
Variant: HF-00004
---
Name: Ariselu
Qty: 3
Variant: HF-00009
-----`;

interface CreateOrderFromTemplateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateOrderFromTemplateDialog({
  open,
  onOpenChange,
}: CreateOrderFromTemplateDialogProps) {
  const [text, setText] = useState('');
  const [errors, setErrors] = useState<string[]>([]);
  const navigate = useNavigate();
  const lookupMutation = useLookupVariantsBySku();

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      setText('');
      setErrors([]);
    }
    onOpenChange(next);
  };

  const handleSubmit = () => {
    const parsed = parseOrderTemplate(text);
    if (parsed.errors.length > 0) {
      setErrors(parsed.errors);
      return;
    }

    const skus = parsed.items.map((item) => item.sku);
    lookupMutation.mutate(skus, {
      onSuccess: (variants) => {
        const bySku = new Map(
          variants.map((variant) => [variant.sku, variant]),
        );
        const missing = skus.filter((sku) => !bySku.has(sku));
        if (missing.length > 0) {
          setErrors([`Unknown SKU(s): ${missing.join(', ')}.`]);
          return;
        }

        const items: OrderItemDraft[] = parsed.items.map(
          ({ sku, quantity }) => {
            const variant = bySku.get(sku)!;
            return {
              variantId: variant.id,
              productName: variant.products?.name ?? '',
              variantTitle: variant.title,
              sku: variant.sku,
              unitPrice: Number(variant.price),
              quantity,
            };
          },
        );

        useOrderDraftStore.getState().setDraft({ items });
        setErrors([]);
        handleOpenChange(false);
        navigate({ to: '/orders/new' });
      },
      onError: (error) => setErrors([error.message]),
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create order from template</DialogTitle>
          <DialogDescription>
            Paste a WhatsApp-style order message. Only the item list wrapped in
            dashes (-----) is used.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-2">
          <Textarea
            rows={10}
            placeholder={PLACEHOLDER}
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="max-h-[60vh] overflow-y-scroll font-mono text-sm"
          />
          {errors.length > 0 && (
            <ul className="text-destructive list-inside list-disc text-sm">
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          )}
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleSubmit}
            disabled={lookupMutation.isPending}
          >
            {lookupMutation.isPending && (
              <Loader2 className="size-4 animate-spin" />
            )}
            Create order
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { Loader2 } from 'lucide-react';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

import {
  useCreateVariant,
  useUpdateVariant,
} from '../hooks/useProductVariants';
import type { ProductVariant } from '../types';

const variantSchema = z
  .object({
    title: z.string().trim().min(1, 'Title is required'),
    price: z
      .string()
      .min(1, 'Price is required')
      .refine((v) => Number(v) >= 0, 'Price must be 0 or more'),
    compareAtPrice: z.string(),
    stock: z
      .string()
      .refine(
        (v) => v === '' || Number.isInteger(Number(v)),
        'Stock must be a whole number',
      ),
    inStock: z.boolean(),
    isDefault: z.boolean(),
    isActive: z.boolean(),
  })
  .refine(
    (data) =>
      data.compareAtPrice === '' ||
      Number(data.compareAtPrice) > Number(data.price),
    {
      message: 'Compare-at price must be greater than the price',
      path: ['compareAtPrice'],
    },
  );

type VariantValues = z.infer<typeof variantSchema>;

interface VariantFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  productId: number;
  variant?: ProductVariant | null;
}

function toDefaultValues(variant?: ProductVariant | null): VariantValues {
  return {
    title: variant?.title ?? '',
    price: variant ? String(variant.price) : '0',
    compareAtPrice:
      variant?.compare_at_price != null ? String(variant.compare_at_price) : '',
    stock: variant ? String(variant.stock) : '0',
    inStock: variant?.in_stock ?? true,
    isDefault: variant?.is_default ?? false,
    isActive: variant?.is_active ?? true,
  };
}

export function VariantFormDialog({
  open,
  onOpenChange,
  productId,
  variant,
}: VariantFormDialogProps) {
  const isEditing = !!variant;
  const createMutation = useCreateVariant(productId);
  const updateMutation = useUpdateVariant(productId);
  const mutation = isEditing ? updateMutation : createMutation;

  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors },
  } = useForm<VariantValues>({
    resolver: zodResolver(variantSchema),
    defaultValues: toDefaultValues(variant),
  });

  useEffect(() => {
    if (open) reset(toDefaultValues(variant));
  }, [open, variant, reset]);

  const onSubmit = (values: VariantValues) => {
    const input = {
      product_id: productId,
      title: values.title,
      price: Number(values.price),
      compare_at_price: values.compareAtPrice
        ? Number(values.compareAtPrice)
        : null,
      stock: Number(values.stock) || 0,
      in_stock: values.inStock,
      is_default: values.isDefault,
      is_active: values.isActive,
    };

    if (isEditing) {
      updateMutation.mutate(
        { id: variant.id, input },
        { onSuccess: () => onOpenChange(false) },
      );
    } else {
      // sku is left blank on purpose — a DB trigger generates HF-000042 style codes.
      createMutation.mutate(
        { ...input, sku: '' },
        { onSuccess: () => onOpenChange(false) },
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Edit variant' : 'New variant'}
          </DialogTitle>
          <DialogDescription>
            The SKU is generated automatically. Title is the label shown to
            customers for this variant (e.g. &quot;500 g&quot; or &quot;Large /
            Red&quot;) — it must be unique for this product.
          </DialogDescription>
        </DialogHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="flex flex-col gap-1.5">
            <Label htmlFor="variant-title">
              Title <span className="text-destructive">*</span>
            </Label>
            <Input
              id="variant-title"
              placeholder="500 g"
              aria-invalid={!!errors.title}
              {...register('title')}
            />
            {errors.title && (
              <p className="text-destructive text-sm">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="variant-price">
                Price (₹) <span className="text-destructive">*</span>
              </Label>
              <Input
                id="variant-price"
                type="number"
                step="0.01"
                {...register('price')}
              />
              {errors.price && (
                <p className="text-destructive text-sm">
                  {errors.price.message}
                </p>
              )}
            </div>
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="variant-compare">Compare-at price (₹)</Label>
              <Input
                id="variant-compare"
                type="number"
                step="0.01"
                aria-invalid={!!errors.compareAtPrice}
                {...register('compareAtPrice')}
              />
              {errors.compareAtPrice && (
                <p className="text-destructive text-sm">
                  {errors.compareAtPrice.message}
                </p>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="variant-stock">Stock</Label>
            <Input id="variant-stock" type="number" {...register('stock')} />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:gap-6">
            <div className="flex items-center gap-2">
              <Switch
                id="variant-in-stock"
                checked={watch('inStock')}
                onCheckedChange={(checked) => setValue('inStock', checked)}
              />
              <Label htmlFor="variant-in-stock">In stock</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="variant-default"
                checked={watch('isDefault')}
                onCheckedChange={(checked) => setValue('isDefault', checked)}
              />
              <Label htmlFor="variant-default">Default variant</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="variant-active"
                checked={watch('isActive')}
                onCheckedChange={(checked) => setValue('isActive', checked)}
              />
              <Label htmlFor="variant-active">Active</Label>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending && (
                <Loader2 className="size-4 animate-spin" />
              )}
              {isEditing ? 'Save changes' : 'Add variant'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { forwardRef, useEffect, useImperativeHandle } from 'react';
import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';

import { CategorySelect } from './CategorySelect.component';

import { productDetailsSchema, type ProductDetailsValues } from '../schemas';

export const PRODUCT_DETAILS_FORM_ID = 'product-details-form';

export interface ProductDetailsFormHandle {
  /** Resets the dirty flag to the form's current values, e.g. after a successful save. */
  markSaved: () => void;
}

interface ProductDetailsFormProps {
  defaultValues: ProductDetailsValues;
  onSubmit: (values: ProductDetailsValues) => void;
  onDirtyChange?: (isDirty: boolean) => void;
}

export const ProductDetailsForm = forwardRef<
  ProductDetailsFormHandle,
  ProductDetailsFormProps
>(function ProductDetailsForm({ defaultValues, onSubmit, onDirtyChange }, ref) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    getValues,
    reset,
    formState: { errors, isDirty },
  } = useForm<ProductDetailsValues>({
    resolver: zodResolver(productDetailsSchema),
    defaultValues,
  });

  useEffect(() => {
    onDirtyChange?.(isDirty);
  }, [isDirty, onDirtyChange]);

  useImperativeHandle(ref, () => ({
    markSaved: () => reset(getValues()),
  }));

  const isActive = watch('is_active');

  return (
    <Card>
      <CardHeader>
        <CardTitle>Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form
          id={PRODUCT_DETAILS_FORM_ID}
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4"
          noValidate
        >
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="product-name"
                aria-invalid={!!errors.name}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-destructive text-sm">
                  {errors.name.message}
                </p>
              )}
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-native-name">Native name</Label>
              <Input id="product-native-name" {...register('native_name')} />
              <p className="text-muted-foreground text-xs">
                Optional Telugu display name shown in the storefront.
              </p>
            </div>

            <div className="flex flex-col gap-1.5">
              <Label htmlFor="product-category">Category</Label>
              <CategorySelect
                value={watch('category_id')}
                onChange={(value) => setValue('category_id', value)}
              />
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-description">Description</Label>
            <Textarea
              id="product-description"
              rows={4}
              {...register('description')}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <Label htmlFor="product-keywords">Keywords</Label>
            <Input
              id="product-keywords"
              placeholder="avakaya, mango pickle, andhra"
              {...register('keywords')}
            />
            <p className="text-muted-foreground text-xs">
              Comma-separated. Helps search find this product.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Switch
              id="product-active"
              checked={isActive}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="product-active">Active</Label>
            <span className="flex items-center gap-1.5 text-sm">
              <span
                className={cn(
                  'size-2 rounded-full',
                  isActive
                    ? 'bg-green-600 dark:bg-green-400'
                    : 'bg-muted-foreground',
                )}
              />
              <span
                className={cn(
                  isActive
                    ? 'text-green-700 dark:text-green-400'
                    : 'text-muted-foreground',
                )}
              >
                {isActive ? 'Visible in catalog' : 'Hidden from catalog'}
              </span>
            </span>
          </div>
        </form>
      </CardContent>
    </Card>
  );
});

import { useForm } from 'react-hook-form';

import { zodResolver } from '@hookform/resolvers/zod';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';

import { CategorySelect } from './CategorySelect.component';

import { productDetailsSchema, type ProductDetailsValues } from '../schemas';

export const PRODUCT_DETAILS_FORM_ID = 'product-details-form';

interface ProductDetailsFormProps {
  defaultValues: ProductDetailsValues;
  onSubmit: (values: ProductDetailsValues) => void;
}

export function ProductDetailsForm({
  defaultValues,
  onSubmit,
}: ProductDetailsFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<ProductDetailsValues>({
    resolver: zodResolver(productDetailsSchema),
    defaultValues,
  });

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
              <Label htmlFor="product-name">Name</Label>
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

          <div className="flex items-center gap-2">
            <Switch
              id="product-active"
              checked={watch('is_active')}
              onCheckedChange={(checked) => setValue('is_active', checked)}
            />
            <Label htmlFor="product-active">Active (visible in catalog)</Label>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}

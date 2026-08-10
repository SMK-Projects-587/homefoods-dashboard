import { ArrowLeft, Loader2 } from 'lucide-react';
import { useNavigate, useParams } from '@tanstack/react-router';

import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ImagesSection } from '@/features/products/components/ImagesSection.component';
import {
  PRODUCT_DETAILS_FORM_ID,
  ProductDetailsForm,
} from '@/features/products/components/ProductDetailsForm.component';
import { VariantsSection } from '@/features/products/components/VariantsSection.component';
import {
  useCreateProduct,
  useProduct,
  useUpdateProduct,
} from '@/features/products/hooks/useProducts';
import { type ProductDetailsValues } from '@/features/products/schemas';

function toDetailsValues(
  product?: {
    name: string;
    native_name: string | null;
    category_id: number | null;
    description: string;
    keywords: string[];
    is_active: boolean;
  } | null,
): ProductDetailsValues {
  return {
    name: product?.name ?? '',
    native_name: product?.native_name ?? '',
    category_id: product?.category_id ? String(product.category_id) : '',
    description: product?.description ?? '',
    keywords: product?.keywords?.join(', ') ?? '',
    is_active: product?.is_active ?? true,
  };
}

function toProductInput(values: ProductDetailsValues) {
  return {
    name: values.name,
    native_name: values.native_name || null,
    category_id: values.category_id ? Number(values.category_id) : null,
    description: values.description,
    keywords: values.keywords
      .split(',')
      .map((k) => k.trim())
      .filter(Boolean),
    is_active: values.is_active,
  };
}

export function ProductFormPage() {
  const params = useParams({ strict: false });
  const productId = params.productId ? Number(params.productId) : undefined;
  const navigate = useNavigate();

  const isEditing = productId !== undefined;
  const { data: product, isPending: isLoadingProduct } = useProduct(
    productId ?? -1,
  );
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct(productId ?? -1);
  const isSaving = createMutation.isPending || updateMutation.isPending;

  if (isEditing && isLoadingProduct) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate({ to: '/products' })}
        >
          <ArrowLeft className="size-4" />
        </Button>
        <div className="min-w-0 flex-1">
          <h1 className="text-foreground truncate text-xl font-semibold">
            {isEditing ? product?.name : 'New product'}
          </h1>
          {isEditing && (
            <p className="text-muted-foreground truncate text-sm">
              {product?.slug}
            </p>
          )}
        </div>
        <Button
          type="submit"
          form={PRODUCT_DETAILS_FORM_ID}
          disabled={isSaving}
        >
          {isSaving && <Loader2 className="size-4 animate-spin" />}
          {isEditing ? 'Save changes' : 'Create product'}
        </Button>
      </div>

      <ProductDetailsForm
        defaultValues={toDetailsValues(product)}
        onSubmit={(values) => {
          const input = toProductInput(values);
          if (isEditing && productId !== undefined) {
            updateMutation.mutate(input);
          } else {
            // slug is left blank on purpose — a DB trigger slugifies the name.
            createMutation.mutate(
              { ...input, slug: '' },
              {
                onSuccess: (created) => {
                  navigate({
                    to: '/products/$productId',
                    params: { productId: String(created.id) },
                  });
                },
              },
            );
          }
        }}
      />

      {isEditing && product && (
        <>
          <VariantsSection
            productId={product.id}
            variants={product.product_variants}
          />
          <ImagesSection
            productId={product.id}
            slug={product.slug}
            images={product.product_images}
          />
        </>
      )}
    </div>
  );
}

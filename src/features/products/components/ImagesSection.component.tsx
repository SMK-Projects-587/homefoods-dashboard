import { useRef, useState } from 'react';

import { Loader2, Star, Trash2, Upload } from 'lucide-react';

import { ConfirmDialog } from '@/components/app/ConfirmDialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

import { ProductImage } from './ProductImage.component';

import {
  useDeleteProductImage,
  useSetPrimaryImage,
  useUploadProductImage,
} from '../hooks/useProductImages';
import type { ProductImage as ProductImageRow } from '../types';

interface ImagesSectionProps {
  productId: number;
  slug: string;
  images: ProductImageRow[];
}

export function ImagesSection({ productId, slug, images }: ImagesSectionProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [pendingDelete, setPendingDelete] = useState<ProductImageRow | null>(
    null,
  );
  const uploadMutation = useUploadProductImage(productId, slug);
  const setPrimaryMutation = useSetPrimaryImage(productId);
  const deleteMutation = useDeleteProductImage(productId);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Images</CardTitle>
        <Button
          size="sm"
          variant="outline"
          disabled={uploadMutation.isPending}
          onClick={() => fileInputRef.current?.click()}
        >
          {uploadMutation.isPending ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Upload className="size-4" />
          )}
          Upload image
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) uploadMutation.mutate(file);
            e.target.value = '';
          }}
        />
      </CardHeader>
      <CardContent>
        {images.length === 0 ? (
          <p className="text-muted-foreground text-sm">No images yet.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
            {images.map((image) => (
              <div key={image.id} className="group relative">
                <ProductImage
                  imageKey={image.image_path}
                  alt={image.alt_text || slug}
                  className="aspect-square w-full"
                />
                {image.is_primary && (
                  <span className="bg-primary text-primary-foreground absolute top-1.5 left-1.5 rounded px-1.5 py-0.5 text-xs">
                    Primary
                  </span>
                )}
                <div className="mt-1.5 flex items-center justify-center gap-1">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className={cn(
                          'size-7',
                          image.is_primary && 'text-primary',
                        )}
                        disabled={
                          image.is_primary || setPrimaryMutation.isPending
                        }
                        onClick={() => setPrimaryMutation.mutate(image.id)}
                      >
                        <Star className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Set as primary</TooltipContent>
                  </Tooltip>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive size-7"
                        onClick={() => setPendingDelete(image)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Delete image</TooltipContent>
                  </Tooltip>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>

      <ConfirmDialog
        open={!!pendingDelete}
        onOpenChange={(open) => !open && setPendingDelete(null)}
        title="Delete image"
        description="Delete this image? This can't be undone."
        isPending={deleteMutation.isPending}
        onConfirm={() =>
          pendingDelete &&
          deleteMutation.mutate(
            { id: pendingDelete.id, imagePath: pendingDelete.image_path },
            { onSuccess: () => setPendingDelete(null) },
          )
        }
      />
    </Card>
  );
}

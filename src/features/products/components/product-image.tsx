import { ImageOff } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useImageUrl } from '@/hooks/use-image-url';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  imageKey: string | undefined;
  alt: string;
  className?: string;
}

export default function ProductImage({
  imageKey,
  alt,
  className,
}: ProductImageProps) {
  const { data: url, isPending } = useImageUrl(imageKey);

  if (!imageKey) {
    return (
      <div
        className={cn(
          'border-border bg-muted text-muted-foreground flex items-center justify-center rounded-md border border-dashed',
          className,
        )}
      >
        <ImageOff className="size-4" />
      </div>
    );
  }

  if (isPending || !url) {
    return <Skeleton className={cn('rounded-md', className)} />;
  }

  return (
    <img
      src={url}
      alt={alt}
      className={cn('border-border rounded-md border object-cover', className)}
    />
  );
}

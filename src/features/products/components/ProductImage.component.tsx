import { useState } from 'react';

import { ImageOff } from 'lucide-react';

import { Skeleton } from '@/components/ui/skeleton';
import { useImageUrl } from '@/hooks/useImageUrl';
import { cn } from '@/lib/utils';

interface ProductImageProps {
  imageKey: string | undefined;
  alt: string;
  className?: string;
}

function Placeholder({ className }: { className?: string }) {
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

export function ProductImage({ imageKey, alt, className }: ProductImageProps) {
  const { data: url, isPending } = useImageUrl(imageKey);
  const [failed, setFailed] = useState(false);

  if (!imageKey || failed) {
    return <Placeholder className={className} />;
  }

  if (isPending || !url) {
    return <Skeleton className={cn('rounded-md', className)} />;
  }

  return (
    <img
      src={url}
      alt={alt}
      onError={() => setFailed(true)}
      className={cn('border-border rounded-md border object-cover', className)}
    />
  );
}

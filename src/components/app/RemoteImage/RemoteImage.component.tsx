import { useState } from 'react';

import { ImageOff } from 'lucide-react';

import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { useImageUrl } from '@/hooks/useImageUrl';
import { cn } from '@/lib/utils';

interface RemoteImageProps {
  /** Storage object key; resolved to a URL via `useImageUrl`. */
  imageKey: string | undefined;
  alt: string;
  /** Sizes the thumbnail box (applied to whichever element is rendered). */
  className?: string;
  /** Click the thumbnail to open a full-size lightbox. Default: true. */
  preview?: boolean;
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

export function RemoteImage({
  imageKey,
  alt,
  className,
  preview = true,
}: RemoteImageProps) {
  const { data: url, isPending } = useImageUrl(imageKey);
  const [failed, setFailed] = useState(false);
  const [open, setOpen] = useState(false);

  if (!imageKey || failed) {
    return <Placeholder className={className} />;
  }

  if (isPending || !url) {
    return <Skeleton className={cn('rounded-md', className)} />;
  }

  if (!preview) {
    return (
      <img
        src={url}
        alt={alt}
        loading="lazy"
        decoding="async"
        onError={() => setFailed(true)}
        className={cn(
          'border-border rounded-md border object-cover',
          className,
        )}
      />
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={`Preview ${alt}`}
        className={cn(
          'border-border block cursor-zoom-in overflow-hidden rounded-md border',
          className,
        )}
      >
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-[95vw] p-2 sm:max-w-3xl">
          <DialogTitle className="sr-only">{alt}</DialogTitle>
          <img
            src={url}
            alt={alt}
            decoding="async"
            className="max-h-[85vh] w-full rounded-md object-contain"
          />
        </DialogContent>
      </Dialog>
    </>
  );
}

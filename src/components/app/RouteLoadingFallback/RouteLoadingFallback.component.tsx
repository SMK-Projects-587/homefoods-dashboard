import { Loader2 } from 'lucide-react';

/** Router-level pending fallback, shown while a lazy route chunk loads. */
export function RouteLoadingFallback() {
  return (
    <div className="flex h-40 items-center justify-center">
      <Loader2 className="text-muted-foreground size-6 animate-spin" />
    </div>
  );
}

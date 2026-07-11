import { useQuery } from '@tanstack/react-query';

import { getImageDownloadUrl } from '@/lib/storage';

// Presigned GET URLs are valid for 10 minutes; refresh a little sooner than that.
export function useImageUrl(key: string | undefined) {
  return useQuery({
    queryKey: ['image-url', key],
    queryFn: () => getImageDownloadUrl(key!),
    enabled: !!key,
    staleTime: 8 * 60 * 1000,
  });
}

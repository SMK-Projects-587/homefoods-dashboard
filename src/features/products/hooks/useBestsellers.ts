import { toast } from 'sonner';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { getBestsellers, saveBestsellers } from '../api';

export const bestsellersKey = ['products', 'bestsellers'] as const;

export function useBestsellers() {
  return useQuery({
    queryKey: bestsellersKey,
    queryFn: getBestsellers,
  });
}

export function useSaveBestsellers() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      orderedIds,
      removedIds,
    }: {
      orderedIds: number[];
      removedIds: number[];
    }) => saveBestsellers(orderedIds, removedIds),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: bestsellersKey });
      toast.success('Bestsellers saved');
    },
    onError: (error: Error) => toast.error(error.message),
  });
}

import { z } from 'zod';

export const productDetailsSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  category_id: z.string(),
  description: z.string(),
  keywords: z.string(),
  is_active: z.boolean(),
});

export type ProductDetailsValues = z.infer<typeof productDetailsSchema>;

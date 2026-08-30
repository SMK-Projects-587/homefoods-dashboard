import { z } from 'zod';

export const productDetailsSchema = z.object({
  name: z.string().trim().min(1, 'Name is required'),
  native_name: z.string().trim(),
  category_id: z.string(),
  description: z.string().trim(),
  keywords: z.string(),
  is_active: z.boolean(),
});

export type ProductDetailsValues = z.infer<typeof productDetailsSchema>;

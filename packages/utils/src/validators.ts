import { z } from "zod";

export const emailSchema = z.string().email();
export const urlSchema = z.string().url();
export const slugSchema = z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/);

export const priceAlertSchema = z.object({
  productId: z.string(),
  targetPrice: z.number().positive(),
  currency: z.string().default("USD"),
});

export const reviewSchema = z.object({
  productId: z.string(),
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  body: z.string().min(10).max(5000),
  pros: z.string().optional(),
  cons: z.string().optional(),
});

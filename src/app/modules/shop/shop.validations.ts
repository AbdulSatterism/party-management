import { z } from 'zod';

const createShopItemSchema = z.object({
  body: z.object({
    category: z.string(),
    title: z.string(),
    price: z.number(),
    link: z.string(),
    rating: z.number(),
  }),
});

const updateShopItemSchema = z.object({
  body: z.object({
    category: z.string().optional(),
    title: z.string().optional(),
    price: z.number().optional(),
    link: z.string().optional(),
    rating: z.number().optional(),
  }),
});

export const shopValidations = {
  createShopItemSchema,
  updateShopItemSchema,
};

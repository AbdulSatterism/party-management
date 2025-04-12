import { z } from 'zod';

export const createShopItemSchema = z.object({
  body: z.object({
    category: z.string(),
    title: z.string(),
    price: z.number(),
    link: z.string(),
    image: z.string(),
    rating: z.number(),
  }),
});

export const shopValidations = {
  createShopItemSchema,
};

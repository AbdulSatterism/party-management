import { z } from 'zod';

const createShopCategorySchema = z.object({
  body: z.object({
    categoryName: z.string(),
  }),
});

const updateShopCategorySchema = z.object({
  body: z.object({
    categoryName: z.string().optional(),
  }),
});

export const ShopCategoryValidation = {
  createShopCategorySchema,
  updateShopCategorySchema,
};

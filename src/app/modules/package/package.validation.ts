import { z } from 'zod';

const createPackage = z.object({
  body: z.object({
    name: z.string(),
    description: z.array(z.string()),
    unitAmount: z.number(),
    interval: z.enum(['day', 'week', 'month', 'year', 'half-year']),
  }),
});
const updatePackage = z.object({
  body: z.object({
    name: z.string(),
    description: z.array(z.string()),
    unitAmount: z.number(),
    interval: z.enum(['day', 'week', 'month', 'year', 'half-year']),
  }),
});

export const packageValidations = {
  createPackage,
  updatePackage,
};

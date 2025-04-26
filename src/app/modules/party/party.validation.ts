import { z } from 'zod';

const createPartyValidationSchema = z.object({
  body: z.object({
    userId: z.string(),
    partyDetails: z
      .string()
      .min(5, 'Party details must be at least 5 characters long'),
    partyTimeStart: z.string(),
    partyTimeEnd: z.string(),
    partyDate: z.string(),
    country: z.string(),
    address: z.string().min(1, 'Location must be at least 1 character long'),
    location: z.object({
      type: z.literal('Point'),
      coordinates: z.array(z.number()),
    }),
    totalSits: z.number().min(1, 'Total sits must be at least 1'),
    partyFee: z.number(),
    paypalAccount: z.string(),
  }),
});

const updatePartyValidationSchema = z.object({
  body: z
    .object({
      userId: z.string().optional(),
      partyDetails: z
        .string()
        .min(5, 'Party details must be at least 5 characters long')
        .optional(),
      partyTimeStart: z.string().optional(),
      partyTimeEnd: z.string().optional(),
      partyDate: z.string().optional(),
      country: z.string().optional(),
      address: z
        .string()
        .min(1, 'Location must be at least 1 character long')
        .optional(),
      location: z
        .object({
          type: z.literal('Point'),
          coordinates: z.array(z.number()),
        })
        .optional(),
      totalSits: z.number().min(1, 'Total sits must be at least 1').optional(),
      partyFee: z.number().optional(),
      paypalAccount: z.string().optional(),
    })
    .optional(),
});

export const PartyValidation = {
  createPartyValidationSchema,
  updatePartyValidationSchema,
};

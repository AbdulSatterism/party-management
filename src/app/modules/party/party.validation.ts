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
    location: z.string().min(1, 'Location must be at least 1 character long'),
    totalSits: z.number().min(1, 'Total sits must be at least 1'),
    partyFee: z.number(),
    paypalAccount: z.string(),
  }),
});

const updatePartyValidationSchema = z.object({
  body: z.object({
    userId: z.string(),
    partyDetails: z
      .string()
      .min(5, 'Party details must be at least 5 characters long'),
    partyTimeStart: z.string(),
    partyTimeEnd: z.string(),
    partyDate: z.string(),
    location: z.string().min(1, 'Location must be at least 1 character long'),
    totalSits: z.number().min(1, 'Total sits must be at least 1'),
    partyFee: z.number(),
    paypalAccount: z.string(),
  }),
});

export const PartyValidation = {
  createPartyValidationSchema,
  updatePartyValidationSchema,
};

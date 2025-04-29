import { z } from 'zod';

const savedPartyValidationSchema = z.object({
  body: z.object({
    userId: z.string(),
    partyId: z.string(),
  }),
});

export const SavedPartyValidation = {
  savedPartyValidationSchema,
};

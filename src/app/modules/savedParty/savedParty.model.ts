import { model, Schema } from 'mongoose';
import { ISavedParty } from './savedParty.interface';

const savedPartySchema = new Schema<ISavedParty>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
  },
  {
    timestamps: true,
  },
);

export const SavedParty = model<ISavedParty>('SavedParty', savedPartySchema);

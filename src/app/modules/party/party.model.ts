import { Schema, model, Document } from 'mongoose';
import { IParty } from './party.interface';

interface IPartyDoc extends IParty, Document {}

const partySchema = new Schema<IPartyDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partyDetails: { type: String, required: true },
    partyTimeStart: { type: String, required: true },
    partyTimeEnd: { type: String, required: true },
    partyDate: { type: String, required: true },
    location: { type: String, required: true },
    participants: [
      { type: Schema.Types.ObjectId, ref: 'User', required: false },
    ],
    partyFee: { type: Number, required: true },
    totalSits: { type: Number, required: true },
    paypalAccount: { type: String, required: true },
  },
  { timestamps: true },
);

export const Party = model<IPartyDoc>('Party', partySchema);

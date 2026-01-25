import { Schema, model, Document } from 'mongoose';
import { IParty } from './party.interface';

interface IPartyDoc extends IParty, Document {}

const partySchema = new Schema<IPartyDoc>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    partyDetails: { type: String, required: true },
    partyName: { type: String, required: true },
    partyTimeStart: { type: String, required: true },
    image: { type: String, required: true },
    income: { type: Number, default: 0 },
    partyTimeEnd: { type: String, required: true },
    partyDate: { type: Date, required: true },
    country: { type: String, required: false },
    address: { type: String, required: true },
    total: { type: Number, required: false, default: 0 },
    soldTicket: { type: Number, default: 0 },
    payoutOption: { type: String, enum: ['PAYPAL', 'STRIPE'], required: true },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number] }, //[example:longtitude->90.413, latitude->23.456]
    },
    participants: [
      { type: Schema.Types.ObjectId, ref: 'User', required: false },
    ],
    partyFee: { type: Number, required: true },
    totalSits: { type: Number, required: true },
    paypalAccount: { type: String, required: true },
  },
  { timestamps: true, versionKey: false },
);

// Create a 2dsphere index on the location field for geospatial queries
// This index is necessary for geospatial queries to work properly
partySchema.index({ location: '2dsphere' });

export const Party = model<IPartyDoc>('Party', partySchema);

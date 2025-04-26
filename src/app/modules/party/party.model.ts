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
    country: { type: String, required: true },
    address: { type: String, required: true },
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
  { timestamps: true },
);

// Create a 2dsphere index on the location field for geospatial queries
// This index is necessary for geospatial queries to work properly
partySchema.index({ location: '2dsphere' });

export const Party = model<IPartyDoc>('Party', partySchema);

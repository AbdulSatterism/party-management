// src/models/userPayout.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IHostPayout } from './payoutHost.interface';

export interface IUserPayoutDoc extends IHostPayout, Document {}

const hostPayoutSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: false, ref: 'User' },
    partyId: { type: Schema.Types.ObjectId, required: true, ref: 'Party' },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    paypalBatchId: { type: String },
    stripePayoutId: { type: String, default: '' },

    status: {
      type: String,
      required: true,
    },
    note: { type: String },
  },
  { timestamps: true },
);

export const HostPayout = mongoose.model<IUserPayoutDoc>(
  'HostPayout',
  hostPayoutSchema,
);

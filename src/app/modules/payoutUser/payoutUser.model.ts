// src/models/userPayout.model.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IUserPayout } from './payoutUser.interface';

export interface IUserPayoutDoc extends IUserPayout, Document {}

const UserPayoutSchema: Schema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
    partyId: { type: Schema.Types.ObjectId, required: true, ref: 'Party' },
    email: { type: String, required: true },
    amount: { type: Number, required: true },
    paypalBatchId: { type: String },
    status: {
      type: String,
      reequired: true,
    },
    note: { type: String },
  },
  { timestamps: true },
);

export const UserPayout = mongoose.model<IUserPayoutDoc>(
  'UserPayout',
  UserPayoutSchema,
);

import { Types } from 'mongoose';

// src/interfaces/payout.interface.ts
export interface IUserPayout {
  userId: Types.ObjectId;
  partyId: Types.ObjectId;
  email: string;
  amount: number;
  status: 'COMPLETED';
  note?: string;
  paypalBatchId?: string;
  stripePayoutId?: string;
}

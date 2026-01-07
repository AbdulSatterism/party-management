import { Types } from 'mongoose';

// src/interfaces/payout.interface.ts
export interface IHostPayout {
  userId?: Types.ObjectId;
  partyId: Types.ObjectId;
  email: string;
  amount: number;
  status: 'COMPLETED';
  paypalBatchId?: string;
  stripePayoutId?: string;
  note?: string;
}

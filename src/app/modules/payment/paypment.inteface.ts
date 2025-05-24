import { Types } from 'mongoose';

export interface IPayment {
  userId: Types.ObjectId;
  partyId: Types.ObjectId;
  status: 'COMPLETED' | 'PENDING' | 'FAILED';
  transactionId: string;
  amount: number;
}

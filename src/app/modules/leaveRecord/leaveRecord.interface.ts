import { Types } from 'mongoose';

export interface ILeaveRecord {
  paymentId: Types.ObjectId;
  refundAmount: number;
  refundStatus: 'PENDING' | 'PAID';
}

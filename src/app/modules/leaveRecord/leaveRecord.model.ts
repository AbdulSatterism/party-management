import { model, Schema } from 'mongoose';
import { ILeaveRecord } from './leaveRecord.interface';

const leaveRecordSchema = new Schema<ILeaveRecord>(
  {
    paymentId: { type: Schema.Types.ObjectId, ref: 'Payment', required: true },
    refundAmount: { type: Number, required: true },
    refundStatus: {
      type: String,
      enum: ['PENDING', 'PAID'],
      default: 'PENDING',
    },
  },
  { timestamps: true, versionKey: false },
);

export const LeaveRecord = model<ILeaveRecord>(
  'LeaveRecord',
  leaveRecordSchema,
);

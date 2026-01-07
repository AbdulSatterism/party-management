// /models/payment.model.ts
import mongoose, { Schema } from 'mongoose';
import { IPayment } from './paypment.inteface';

const paymentSchema = new Schema<IPayment>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    transactionId: { type: String, required: true },
    partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
    amount: { type: Number, required: true },
    paymentMethod: {
      type: String,
      enum: ['PAYPAL', 'STRIPE'],
      required: false,
    },
    status: {
      type: String,
      enum: ['PENDING', 'COMPLETED', 'FAILED'],
      default: 'PENDING',
    },
  },

  {
    timestamps: true,
  },
);

export const Payment = mongoose.model<IPayment>('Payment', paymentSchema);

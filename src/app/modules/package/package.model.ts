import { model, Schema } from 'mongoose';
import { IPackage } from './package.interface';

const PackageSchema = new Schema<IPackage>(
  {
    name: { type: String, required: true, trim: true },
    description: { type: [String], required: true },
    unitAmount: { type: Number, required: true, min: 0 },
    interval: {
      type: String,
      enum: ['day', 'week', 'month', 'year', 'half-year'],
      required: true,
    },
    productId: { type: String, required: true, unique: true },
    priceId: { type: String, required: true, unique: true },
    price: { type: Number },
  },
  { timestamps: true },
);

export const Package = model('Package', PackageSchema);

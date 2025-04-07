import { Types } from 'mongoose';

export type ISubscription = {
  package: Types.ObjectId;
  user: Types.ObjectId;
  subscriptionId: string;
  stripeCustomerId: string;
  status: string;
  startDate: Date;
  endDate: Date;
  email: string;
  amount: number;
  time: string;
  priceId: string;
};

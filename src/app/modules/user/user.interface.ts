/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type IUser = {
  name?: string;
  email: string;
  phone?: string;
  password?: string;
  role?: 'ADMIN' | 'USER' | 'HOST';
  image?: string;
  passport?: string;
  residential?: string;
  isDeleted?: boolean;
  googleId?: string;
  facebookId?: string;
  appleId?: string;
  hostRequest?: 'NONE' | 'REQUESTED' | 'APPROVED' | 'REJECTED';
  paypalAccount?: string;
  playerId?: [string];
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  verified: boolean;
  stripeAccountId?: string;
  isStripeConnected?: boolean;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;

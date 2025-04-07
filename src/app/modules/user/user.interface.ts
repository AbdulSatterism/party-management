/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Model } from 'mongoose';

export type IUser = {
  name?: string;
  email: string;
  phone?: string;
  password: string;
  role: 'ADMIN' | 'USER' | 'OWNER';
  gender?: 'MALE' | 'FEMALE' | 'OTHERS';
  image?: string;
  dob?: string;
  isDeleted?: boolean;
  authentication?: {
    isResetPassword: boolean;
    oneTimeCode: number;
    expireAt: Date;
  };
  verified: boolean;
};

export type UserModal = {
  isExistUserById(id: string): any;
  isExistUserByEmail(email: string): any;
  isAccountCreated(id: string): any;
  isMatchPassword(password: string, hashPassword: string): boolean;
} & Model<IUser>;

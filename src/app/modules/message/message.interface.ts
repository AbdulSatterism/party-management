import { Types } from 'mongoose';

export type TMessage = {
  groupId: Types.ObjectId;
  senderId: Types.ObjectId;
  message: string;
};

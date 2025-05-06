import { Types } from 'mongoose';

export interface IChatGroup {
  partyId: Types.ObjectId;
  groupName: string;
  members: {
    userId: Types.ObjectId;
    ticket: number;
  }[];
}

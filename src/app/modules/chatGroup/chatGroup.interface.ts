import { Types } from 'mongoose';

// TODO: need to update this section for user add or remove like ticket will fixed and limit will changeable

export interface IChatGroup {
  partyId: Types.ObjectId;
  groupName: string;
  members: {
    userId: Types.ObjectId;
    ticket: number;
  }[];
}

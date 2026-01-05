import { Types } from 'mongoose';

export interface IChatGroup {
  partyId: Types.ObjectId;
  groupName?: string;
  isActive?: boolean;
  members: {
    userId: Types.ObjectId;
    ticket: number;
    limit: number;
    guest?: Types.ObjectId[];
  }[];
}

export interface IReport {
  title?: string;
  reportedId?: string;
}

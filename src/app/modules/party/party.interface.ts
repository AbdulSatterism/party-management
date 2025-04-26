import { Types } from 'mongoose';

export interface IParty {
  userId: Types.ObjectId;
  partyDetails: string;
  partyTimeStart: string;
  partyTimeEnd: string;
  partyDate: string;
  participants?: Types.ObjectId[];
  totalSits: number;
  partyFee: number;
  address: string;
  location: {
    type: string;
    coordinates: number[];
  };
  paypalAccount: string;
}

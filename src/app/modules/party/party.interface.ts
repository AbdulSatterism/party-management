import { Types } from 'mongoose';

export interface IParty {
  userId: Types.ObjectId;
  partyDetails: string;
  partyName: string;
  partyTimeStart: string;
  image: string;
  partyTimeEnd: string;
  partyDate: string;
  income: number;
  participants?: Types.ObjectId[];
  totalSits: number;
  partyFee: number;
  country: string;
  address: string;
  soldTicket?: number;
  location: {
    type: string;
    coordinates: number[]; //[example:longtitude->90.413, latitude->23.456]
  };
  paypalAccount: string;
}

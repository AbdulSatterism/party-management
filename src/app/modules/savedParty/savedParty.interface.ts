import { Types } from 'mongoose';

export interface ISavedParty {
  userId: Types.ObjectId;
  partyId: Types.ObjectId;
}

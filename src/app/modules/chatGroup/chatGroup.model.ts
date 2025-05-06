import { model, Schema } from 'mongoose';
import { IChatGroup } from './chatGroup.interface';

const chatGroupSchema = new Schema<IChatGroup>(
  {
    partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
    groupName: { type: String, required: true },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        ticket: { type: Number, default: 0 },
      },
    ],
  },
  { timestamps: true },
);

// Model creation for ChatGroup
export const ChatGroup = model<IChatGroup>('ChatGroup', chatGroupSchema);

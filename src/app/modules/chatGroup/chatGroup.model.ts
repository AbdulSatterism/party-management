import { model, Schema } from 'mongoose';
import { IChatGroup, IReport } from './chatGroup.interface';

const chatGroupSchema = new Schema<IChatGroup>(
  {
    partyId: { type: Schema.Types.ObjectId, ref: 'Party', required: true },
    groupName: { type: String, required: false },
    members: [
      {
        userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
        ticket: { type: Number, default: 0 },
        limit: { type: Number, default: 0 },
        guest: [{ type: Schema.Types.ObjectId, ref: 'User' }],
      },
    ],
  },
  { timestamps: true },
);

const reportSchema = new Schema<IReport>(
  {
    title: { type: String, required: false },
    reportedId: { type: String, required: false },
  },
  { timestamps: true },
);

// Model creation for ChatGroup
export const ChatGroup = model<IChatGroup>('ChatGroup', chatGroupSchema);

// Model creation for Report
export const Report = model<IReport>('Report', reportSchema);

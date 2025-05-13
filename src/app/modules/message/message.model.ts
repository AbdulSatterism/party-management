import { model, Schema } from 'mongoose';
import { TMessage } from './message.interface';

const messageSchema = new Schema<TMessage>(
  {
    groupId: {
      type: Schema.Types.ObjectId,
      ref: 'ChatGroup',
      required: true,
    },
    senderId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    message: { type: String, required: true },
  },
  {
    timestamps: true,
  },
);

export const Message = model<TMessage>('Message', messageSchema);

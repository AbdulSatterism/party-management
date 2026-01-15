/* eslint-disable no-console */
import colors from 'colors';
import { Server } from 'socket.io';
import { logger } from '../shared/logger';
import { Message } from '../app/modules/message/message.model';
import { ChatGroup } from '../app/modules/chatGroup/chatGroup.model';
import { User } from '../app/modules/user/user.model';
import { sendPushNotification } from '../util/onesignal';

const socket = (io: Server) => {
  io.on('connection', socket => {
    logger.info(colors.blue('A user connected'));

    // Join a chat room
    socket.on('join', groupId => {
      socket.join(groupId);
      logger.info(colors.green(`User joined room: ${groupId}`));
    });

    socket.on('send-message', async ({ groupId, senderId, message }) => {
      try {
        // Save the message to the database
        const newMessage = await Message.create({
          groupId,
          senderId,
          message,
        });

        // Populate the senderId field
        const populatedMessage = await newMessage.populate(
          'senderId',
          'name email image',
        );

        // Emit the message to all users in the specified chat room
        io.emit(
          `receive-message:${populatedMessage.groupId}`,
          populatedMessage,
        );
        // send push notification to all group members

        const chatGroup = await ChatGroup.findById(groupId).lean();
        if (chatGroup) {
          const memberUserIds = chatGroup.members?.map(m =>
            m.userId.toString(),
          ) as string[];
          const memberUsers = await User.find({ _id: { $in: memberUserIds, $ne: senderId } })
            .select('playerId')
            .lean();
          const playerIds = memberUsers.map(u => u.playerId).flat() as string[];
          const senderUser = await User.findById(senderId).lean();
          const notificationMessage = `${senderUser?.name || 'Someone'} sent a new message`;

          await sendPushNotification(
            playerIds,
            senderUser?.name || 'someone',
            notificationMessage,
          );
        }
      } catch (error) {
        console.error('Error sending message:', error);
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      logger.info(colors.red('A user disconnect'));
    });
  });
};

export default socket;

export const socketHelper = { socket };

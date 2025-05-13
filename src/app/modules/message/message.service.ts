//* get all message by specific chatGroup

import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { ChatGroup } from '../chatGroup/chatGroup.model';
import { Message } from './message.model';

const showAllMessageSpeceficGroup = async (
  groupId: string,
  query: { limit: number; page: number },
) => {
  const { limit, page } = query;
  // Check if the chat group exists
  const existChatGroup = await ChatGroup.findById(groupId);

  if (!existChatGroup) {
    throw new AppError(StatusCodes.NOT_FOUND, 'This chat group not found');
  }

  // Pagination logic
  const skip = (page - 1) * limit;

  // Fetch total count of messages
  const totalMessages = await Message.countDocuments({ groupId });

  // Fetch messages with pagination
  const messages = await Message.find({ groupId })
    .populate('senderId', 'name email image') // Populate sender details (e.g., name, email)
    .sort({ createdAt: -1 }) // Sort by latest messages
    .skip(skip) // Skip documents for pagination
    .limit(limit); // Limit the number of documents

  // Calculate total pages
  const totalPages = Math.ceil(totalMessages / limit);

  return {
    totalMessages,
    totalPages,
    currentPage: Number(page),
    limit: Number(limit),
    messages,
  };
};

export const messageService = {
  showAllMessageSpeceficGroup,
};

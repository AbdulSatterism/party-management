/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import { ChatGroup } from './chatGroup.model';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';

const chattingGroupbySpecificUser = async (
  userId: string,
  query: { search: string },
) => {
  const { search } = query;

  const baseQuery: {
    $or: { [key: string]: string }[];
    groupName?: { $regex: string; $options: string };
  } = {
    $or: [{ 'members.userId': userId }, { 'members.guest': userId }],
  };

  // If the search term is provided, add it to the query to filter by groupName
  if (search) {
    baseQuery['groupName'] = { $regex: search, $options: 'i' }; // Case-insensitive regex search
  }

  const groups = await ChatGroup.find(baseQuery)
    .populate('partyId', 'image partyDate -_id')
    .lean();
  return groups;
};

const addNewMember = async (
  userId: string,
  groupId: string,
  guestId: string,
) => {
  const group = await ChatGroup.findOne(
    {
      _id: groupId,
      'members.userId': userId,
    },
    { 'members.$': 1 },
  );

  const isUserExist = await User.findById(guestId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Guest not found');
  }

  if (!group) {
    throw new AppError(
      StatusCodes.NOT_FOUND,
      'Group not found or not authorized to add',
    );
  }

  const member = group.members[0]; // Direct access since we used projection

  // Check guest limit
  if (member.limit <= 1) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Guest limit reached');
  }

  // Update in single operation
  const updatedGroup = await ChatGroup.findOneAndUpdate(
    { _id: groupId, 'members.userId': userId },
    {
      $push: { 'members.$.guest': guestId },
      $inc: { 'members.$.limit': -1 },
    },
    { new: true },
  );

  return updatedGroup;
};

const getUserList = async (
  userId: string,
  groupId: string,
  search?: string,
) => {
  const group = await ChatGroup.findById(groupId);

  if (!group) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Group not found');
  }

  // Collect all existing member and guest IDs
  const existingUserIds = new Set<string>();

  group.members.forEach(member => {
    // Exclude userId
    existingUserIds.add(member.userId.toString());

    // Exclude guests if they exist
    if (member.guest && Array.isArray(member.guest)) {
      member.guest.forEach(guestId => {
        existingUserIds.add(guestId.toString());
      });
    }
  });

  const query: any = {
    _id: { $nin: Array.from(existingUserIds) },
  };

  if (search) {
    query.name = { $regex: search, $options: 'i' }; // Case-insensitive search
  }

  const users = await User.find(query);
  return users;
};

export const chatGroupService = {
  chattingGroupbySpecificUser,
  addNewMember,
  getUserList,
};

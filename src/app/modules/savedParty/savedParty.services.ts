import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Party } from '../party/party.model';
import { User } from '../user/user.model';
import { SavedParty } from './savedParty.model';

const savedParty = async (userId: string, partyId: string) => {
  const isUserExist = await User.isExistUserById(userId);

  const isPartyExist = await Party.findById(partyId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (!isPartyExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Party not found');
  }

  const alreadySaved = await SavedParty.findOne({ userId, partyId });

  if (alreadySaved) {
    throw new AppError(StatusCodes.CONFLICT, 'You already saved this party!');
  }

  const value = { userId, partyId };
  const saved = await SavedParty.create(value);

  return saved;
};

const getMySavedParties = async (userId: string) => {
  const isUserExist = await User.isExistUserById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  const savedParties = await SavedParty.find({ userId })
    .populate({
      path: 'partyId',
      populate: { path: 'userId', select: 'name email image' },
    })
    .populate('userId', 'name email image');

  return savedParties;
};

const removeSavedParty = async (userId: string, partyId: string) => {
  const isUserExist = await User.isExistUserById(userId);

  const isPartyExist = await Party.findById(partyId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  if (!isPartyExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Party not found');
  }

  const removed = await SavedParty.findOneAndDelete({ userId, partyId });

  return removed;
};

export const SavedPartyService = {
  savedParty,
  getMySavedParties,
  removeSavedParty,
};

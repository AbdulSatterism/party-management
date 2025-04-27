import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IParty } from './party.interface';
import mongoose from 'mongoose';
import { Party } from './party.model';

const createParyty = async (userId: string, payload: IParty) => {
  const isUserExist = await User.isExistUserById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  if (isUserExist.role !== 'HOST') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to create a party!',
    );
  }

  payload.userId = new mongoose.Types.ObjectId(userId);

  const party = await Party.create(payload);

  return party;
};

export const PartyService = {
  createParyty,
};

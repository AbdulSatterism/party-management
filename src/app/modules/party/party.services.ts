/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IParty } from './party.interface';
import mongoose from 'mongoose';
import { Party } from './party.model';
import unlinkFile from '../../../shared/unlinkFile';
import { ChatGroup } from '../chatGroup/chatGroup.model';

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

const getNearbyParties = async (query: {
  lat?: number;
  lon?: number;
  days?: number;
  search?: string;
  country?: string;
}) => {
  const { lat, lon, days, search, country } = query;

  const pipeline: any[] = [];

  // Add geoNear if latitude and longitude are provided
  if (lat && lon) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        distanceField: 'distance',
        spherical: true,
        distanceMultiplier: 0.001, // Convert meters to kilometers
      },
    });
  }

  const matchConditions: any = {};

  // Filter by partyDate (if days are provided)
  if (days) {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);

    matchConditions.partyDate = {
      $gte: today.toISOString().split('T')[0],
      $lte: futureDate.toISOString().split('T')[0],
    };
  }

  // Filter by partyName (partial search, case-insensitive)
  if (search) {
    const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); // Escape regex characters
    matchConditions.partyName = { $regex: `.*${safeSearch}.*`, $options: 'i' };
  }

  // Filter by country (partial match, case-insensitive)
  if (country) {
    const safeCountry = country.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&'); // Escape regex characters
    matchConditions.country = { $regex: `.*${safeCountry}.*`, $options: 'i' };
  }

  // If we have any match conditions, push the $match stage
  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  // 👉 ADD THIS CHECK 👇
  if (pipeline.length === 0) {
    pipeline.push({ $match: {} }); // default match all if no condition given
  }

  // Perform aggregation and return the result
  const parties = await Party.aggregate(pipeline);

  return parties;
};

//* signle party with participants

const getSingleParty = async (partyId: string) => {
  const isPartyExist = await Party.findById(partyId)
    .populate([
      { path: 'participants', select: 'name email image' },
      { path: 'userId', select: 'name email image' },
    ])
    .lean();

  if (!isPartyExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Party not found!');
  }

  return {
    ...isPartyExist,
    totalParticipants: isPartyExist.participants?.length || 0,
  };
};

//* all parties by specific host

const getAllPartiesByHost = async (userId: string) => {
  const isUserExist = await User.isExistUserById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  const hostParties = await Party.find({ userId }).populate([
    { path: 'participants', select: 'name email image' },
    { path: 'userId', select: 'name email image' },
  ]);

  return hostParties;
};

const updateParty = async (
  userId: string,
  partyId: string,
  payload: Partial<IParty>,
) => {
  const isUserExist = await User.isExistUserById(userId);
  const isPartyExist = await Party.findById(partyId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  if (!isPartyExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Party not found!');
  }

  if (isUserExist._id.toString() !== isPartyExist.userId.toString()) {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to update this party!',
    );
  }

  if (payload.image && isPartyExist.image) {
    unlinkFile(isPartyExist.image);
  }

  const updatedParty = await Party.findByIdAndUpdate(
    partyId,
    { $set: payload },
    { new: true },
  );

  return updatedParty;
};

//! join party with chat group

//TODO: have to implement payment system then will be model for user payment history with party

//TODO: need update this query for ticket limit

//* not implemented payment system yet

//* so just when a user join a party user can buy multiple tickets and when
const joinParty = async (userId: string, payload: any) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [isUserExist, isPartyExist] = await Promise.all([
      User.isExistUserById(userId),
      Party.findById(payload.partyId),
    ]);

    if (!isUserExist) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
    }

    if (!isPartyExist) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Party not found!');
    }

    // Check if enough seats are available
    if (isPartyExist.totalSits < payload.ticket) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Not enough seats available!',
      );
    }

    const isParticipant = isPartyExist.participants?.some(
      participantId => participantId.toString() === userId,
    );

    if (isParticipant) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'You are already a participant!',
      );
    }

    // Calculate income after 10% deduction
    const deductionRate = 0.9; // 90% after 10% deduction
    const finalAmount = payload.amount * deductionRate;

    const chatGroup = await ChatGroup.findOne({
      partyId: payload.partyId,
    }).session(session);

    if (chatGroup) {
      const isUserInGroup = chatGroup.members.find(
        member => member.userId.toString() === userId,
      );

      if (!isUserInGroup) {
        await ChatGroup.findByIdAndUpdate(
          chatGroup._id,
          {
            $push: {
              members: {
                userId,
                ticket: payload.ticket,
              },
            },
          },
          { new: true, session },
        );
      }

      const updatedParty = await Party.findByIdAndUpdate(
        payload.partyId,
        {
          $push: { participants: userId },
          $inc: { totalSits: -payload.ticket, income: finalAmount },
        },
        { new: true, session },
      );

      await session.commitTransaction();
      return updatedParty;
    }

    const [newChatGroup, updatedParty] = await Promise.all([
      ChatGroup.create(
        [
          {
            partyId: payload.partyId,
            groupName: isPartyExist.partyName,
            members: [
              {
                userId,
                ticket: payload.ticket,
              },
            ],
          },
        ],
        { session },
      ),
      Party.findByIdAndUpdate(
        payload.partyId,
        {
          $push: { participants: userId },
          $inc: { totalSits: -payload.ticket, income: finalAmount },
        },
        { new: true, session },
      ),
    ]);

    if (!newChatGroup[0] || !updatedParty) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error creating chat group or updating party!',
      );
    }

    await session.commitTransaction();
    return updatedParty;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

export const PartyService = {
  createParyty,
  updateParty,
  getNearbyParties,
  getSingleParty,
  getAllPartiesByHost,
  joinParty,
};

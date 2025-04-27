/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IParty } from './party.interface';
import mongoose from 'mongoose';
import { Party } from './party.model';
import unlinkFile from '../../../shared/unlinkFile';

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

export const PartyService = {
  createParyty,
  updateParty,
  getNearbyParties,
};

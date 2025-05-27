/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IParty } from './party.interface';
import mongoose from 'mongoose';
import { Party } from './party.model';
import unlinkFile from '../../../shared/unlinkFile';
import { ChatGroup } from '../chatGroup/chatGroup.model';
import { captureOrder, payoutToHost } from '../payment/utils';
import { Payment } from '../payment/payment.model';

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
    const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    matchConditions.partyName = { $regex: `.*${safeSearch}.*`, $options: 'i' };
  }

  // Filter by country (partial match, case-insensitive)
  if (country) {
    const safeCountry = country.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    matchConditions.country = { $regex: `.*${safeCountry}.*`, $options: 'i' };
  }

  // If we have any match conditions, push the $match stage
  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  if (pipeline.length === 0) {
    pipeline.push({ $match: {} });
  }

  // Add lookup stage for userId
  // Add lookup for userId
  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'userId',
      foreignField: '_id',
      pipeline: [
        {
          $project: {
            email: 1,
            image: 1,
            name: 1,
          },
        },
      ],
      as: 'userId',
    },
  });

  pipeline.push({
    $lookup: {
      from: 'users',
      localField: 'participants',
      foreignField: '_id',
      pipeline: [
        {
          $project: {
            email: 1,
            image: 1,
            name: 1,
          },
        },
      ],
      as: 'participants',
    },
  });

  // Unwind the userId array to object
  pipeline.push({
    $unwind: {
      path: '$userId',
      preserveNullAndEmptyArrays: true,
    },
  });

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

//* not implemented payment system yet

//* so just when a user join a party user can buy multiple tickets and when

// const joinParty = async (userId: string, payload: any) => {
//   const session = await mongoose.startSession();
//   session.startTransaction();

//   try {
//     const [isUserExist, isPartyExist] = await Promise.all([
//       User.isExistUserById(userId),
//       Party.findById(payload.partyId),
//     ]);

//     if (!isUserExist) {
//       throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
//     }

//     if (!isPartyExist) {
//       throw new AppError(StatusCodes.NOT_FOUND, 'Party not found!');
//     }

//     // Check if enough seats are available
//     if (isPartyExist.totalSits < payload.ticket) {
//       throw new AppError(
//         StatusCodes.BAD_REQUEST,
//         'Not enough seats available!',
//       );
//     }

//     const isParticipant = isPartyExist.participants?.some(
//       participantId => participantId.toString() === userId,
//     );

//     if (isParticipant) {
//       throw new AppError(
//         StatusCodes.BAD_REQUEST,
//         'You are already a participant!',
//       );
//     }

//     // Calculate income after 10% deduction
//     const deductionRate = 0.9; // 90% after 10% deduction
//     const finalAmount = payload.amount * deductionRate;

//     const chatGroup = await ChatGroup.findOne({
//       partyId: payload.partyId,
//     }).session(session);

//     if (chatGroup) {
//       const isUserInGroup = chatGroup.members.find(
//         member => member.userId.toString() === userId,
//       );

//       if (!isUserInGroup) {
//         await ChatGroup.findByIdAndUpdate(
//           chatGroup._id,
//           {
//             $push: {
//               members: {
//                 userId,
//                 ticket: payload.ticket,
//                 limit: payload.ticket,
//               },
//             },
//           },
//           { new: true, session },
//         );
//       }

//       const updatedParty = await Party.findByIdAndUpdate(
//         payload.partyId,
//         {
//           $push: { participants: userId },
//           $inc: {
//             totalSits: -payload.ticket,
//             income: finalAmount,
//             soldTicket: payload.ticket,
//           },
//         },
//         { new: true, session },
//       );

//       await session.commitTransaction();
//       return updatedParty;
//     }

//     const [newChatGroup, updatedParty] = await Promise.all([
//       ChatGroup.create(
//         [
//           {
//             partyId: payload.partyId,
//             groupName: isPartyExist.partyName,
//             members: [
//               {
//                 userId,
//                 ticket: payload.ticket,
//                 limit: payload.ticket,
//               },
//             ],
//           },
//         ],
//         { session },
//       ),
//       Party.findByIdAndUpdate(
//         payload.partyId,
//         {
//           $push: { participants: userId },
//           $inc: {
//             totalSits: -payload.ticket,
//             income: finalAmount,
//             soldTicket: payload.ticket,
//           },
//         },
//         { new: true, session },
//       ),
//     ]);

//     if (!newChatGroup[0] || !updatedParty) {
//       throw new AppError(
//         StatusCodes.INTERNAL_SERVER_ERROR,
//         'Error creating chat group or updating party!',
//       );
//     }

//     await session.commitTransaction();
//     return updatedParty;
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };

//!
interface JoinPartyPayload {
  partyId: string;
  ticket: number;
  amount: number; // total user payment amount
  orderId: string; // PayPal order ID from frontend
}

export const joinParty = async (userId: string, payload: JoinPartyPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Step 1: Check if user and party exist
    const [userExists, party] = await Promise.all([
      User.isExistUserById(userId), // Check if user exists
      Party.findById(payload.partyId).session(session), // Find the party by ID
    ]);

    if (!userExists) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    }

    if (!party) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Party not found');
    }

    if (!party.participants) {
      party.participants = []; // Initialize participants if it's empty
    }

    // Step 2: Check if there are enough seats
    if (party.totalSits < payload.ticket) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Not enough seats');
    }

    // Step 3: Check if the user is already a participant
    if (party.participants?.some(p => p.toString() === userId)) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Already a participant');
    }

    // Step 4: Capture PayPal order
    const captureResponse = await captureOrder(payload.orderId); // Capture payment
    if (!captureResponse || captureResponse.status !== 'COMPLETED') {
      throw new AppError(StatusCodes.PAYMENT_REQUIRED, 'Payment not completed');
    }

    // Step 5: Save payment information
    const captureId = captureResponse.purchase_units[0].payments.captures[0].id;
    //for save payment email in user paypalAccount
    const paypalEmail = captureResponse.payer?.email_address;
    const captureStatus = captureResponse.status;

    await User.findByIdAndUpdate(
      userId,
      { paypalAccount: paypalEmail },
      { session },
    );

    await Payment.create({
      userId,
      partyId: payload.partyId,
      status: captureStatus,
      transactionId: captureId,
      amount: payload.amount,
    });

    // Step 6: Payout 90% to the host
    const hostAmount = +(payload.amount * 0.9).toFixed(2);
    await payoutToHost(
      party.paypalAccount,
      hostAmount,
      party.partyName,
      payload.partyId,
    );

    // Step 7: Update party and chat group atomically
    const chatGroup = await ChatGroup.findOne({
      partyId: payload.partyId,
    }).session(session);

    if (chatGroup) {
      if (!chatGroup.members.some(m => m.userId.toString() === userId)) {
        chatGroup.members.push({
          userId: new mongoose.Types.ObjectId(userId),
          ticket: payload.ticket,
          limit: payload.ticket,
        });
        await chatGroup.save({ session });
      }
      party.participants.push(new mongoose.Types.ObjectId(userId));
      party.totalSits -= payload.ticket;
      party.income += hostAmount;
      party.soldTicket += payload.ticket;
      await party.save({ session });
      await session.commitTransaction();
      return party;
    }

    // If no chat group exists, create a new one
    await ChatGroup.create(
      [
        {
          partyId: payload.partyId,
          groupName: party.partyName,
          members: [{ userId, ticket: payload.ticket, limit: payload.ticket }],
        },
      ],
      { session },
    );

    party.participants.push(new mongoose.Types.ObjectId(userId));
    party.totalSits -= payload.ticket;
    party.income += hostAmount;
    party.soldTicket += payload.ticket;
    await party.save({ session });

    await session.commitTransaction();
    return party;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const leaveParty = async (userId: string, partyId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();
  try {
    const [isUserExist, isPartyExist, chatGroup] = await Promise.all([
      User.isExistUserById(userId),
      Party.findById(partyId)
        .populate('participants', 'name email image')
        .lean(),
      ChatGroup.findOne({ partyId }).session(session),
    ]);

    if (!isUserExist) {
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
    }

    if (!isPartyExist) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Party not found!');
    }

    const currentDate = new Date();
    const partyDate = new Date(isPartyExist.partyDate);
    const daysDifference = Math.ceil(
      (partyDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24),
    );

    if (daysDifference < 7) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Cannot leave party within 7 days of the event!',
      );
    }

    const isParticipant = isPartyExist.participants?.some(
      participantId => participantId._id.toString() === userId.toString(),
    );

    if (!isParticipant) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'You are not a participant!');
    }

    if (!chatGroup) {
      throw new AppError(StatusCodes.NOT_FOUND, 'Chat group not found!');
    }

    const userInGroup = chatGroup.members.find(
      member => member.userId.toString() === userId,
    );

    if (!userInGroup) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'User not found in chat group!',
      );
    }

    const ticketsToReturn = userInGroup.ticket;
    const incomeToDeduct = ticketsToReturn * isPartyExist.partyFee * 0.9; // 90% of the total amount (10% deduction)

    await ChatGroup.findByIdAndUpdate(
      chatGroup._id,
      {
        $pull: {
          members: {
            userId: new mongoose.Types.ObjectId(userId),
          },
        },
      },
      { new: true, session },
    );

    const updatedParty = await Party.findByIdAndUpdate(
      partyId,
      {
        $pull: { participants: userId },
        $inc: {
          totalSits: ticketsToReturn,
          soldTicket: -ticketsToReturn,
          income: -incomeToDeduct, // Deduct the income
        },
      },
      { new: true, session },
    );

    if (!updatedParty) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error updating party!',
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

// export const leaveParty = async (userId: string, partyId: string) => {
//   const session = await mongoose.startSession();
//   try {
//     session.startTransaction();

//     const [userExists, party, chatGroup] = await Promise.all([
//       User.isExistUserById(userId), // Ensure this checks session if needed or do normal findById with session
//       Party.findById(partyId).session(session),
//       ChatGroup.findOne({ partyId }).session(session),
//     ]);

//     if (!userExists) {
//       await session.abortTransaction();
//       throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
//     }

//     if (!party) {
//       await session.abortTransaction();
//       throw new AppError(StatusCodes.NOT_FOUND, 'Party not found!');
//     }

//     if (!chatGroup) {
//       await session.abortTransaction();
//       throw new AppError(StatusCodes.NOT_FOUND, 'Chat group not found!');
//     }

//     // Check date diff
//     const currentDate = new Date();
//     const partyDate = new Date(party.partyDate);
//     const daysLeft = Math.ceil(
//       (partyDate.getTime() - currentDate.getTime()) / (1000 * 3600 * 24),
//     );

//     if (daysLeft < 7) {
//       await session.abortTransaction();
//       throw new AppError(
//         StatusCodes.BAD_REQUEST,
//         'Cannot leave party within 7 days of the event!',
//       );
//     }

//     const isParticipant = party.participants?.some(
//       p => p.toString() === userId.toString(),
//     );

//     if (!isParticipant) {
//       await session.abortTransaction();
//       throw new AppError(StatusCodes.BAD_REQUEST, 'You are not a participant!');
//     }

//     const userInGroup = chatGroup.members.find(
//       m => m.userId.toString() === userId,
//     );
//     if (!userInGroup) {
//       await session.abortTransaction();
//       throw new AppError(
//         StatusCodes.BAD_REQUEST,
//         'User not found in chat group!',
//       );
//     }

//     const ticketsToReturn = userInGroup.ticket;
//     const incomeToDeduct = +(ticketsToReturn * party.partyFee * 0.9).toFixed(2);

//     const userDoc = await User.findById(userId).session(session);
//     if (!userDoc?.paypalAccount) {
//       await session.abortTransaction();
//       throw new AppError(
//         StatusCodes.BAD_REQUEST,
//         'User PayPal account not found!',
//       );
//     }

//     if (!party.paypalAccount) {
//       await session.abortTransaction();
//       throw new AppError(
//         StatusCodes.BAD_REQUEST,
//         'Party host PayPal account not found!',
//       );
//     }

//     // Refund payout
//     await payoutToUser(
//       userDoc.paypalAccount,
//       incomeToDeduct,
//       party.partyName,
//       partyId,
//     );

//     // Remove user from chat group
//     await ChatGroup.findByIdAndUpdate(
//       chatGroup._id,
//       { $pull: { members: { userId: new mongoose.Types.ObjectId(userId) } } },
//       { session, new: true },
//     );

//     // Update party participants & stats
//     party.participants = (party.participants || []).filter(
//       p => p.toString() !== userId.toString(),
//     );
//     party.totalSits += ticketsToReturn;
//     party.soldTicket -= ticketsToReturn;
//     party.income -= incomeToDeduct;

//     await party.save({ session });

//     await session.commitTransaction();

//     return party;
//   } catch (error) {
//     await session.abortTransaction();
//     throw error;
//   } finally {
//     session.endSession();
//   }
// };

export const PartyService = {
  createParyty,
  updateParty,
  getNearbyParties,
  getSingleParty,
  getAllPartiesByHost,
  joinParty,
  leaveParty,
};

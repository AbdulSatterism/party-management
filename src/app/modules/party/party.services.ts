/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IParty } from './party.interface';
import mongoose, { Types } from 'mongoose';
import { Party } from './party.model';
import unlinkFile from '../../../shared/unlinkFile';
import { ChatGroup } from '../chatGroup/chatGroup.model';
import { SavedParty } from '../savedParty/savedParty.model';
import { IPartyJoinConfirmation } from '../../../types/emailTamplate';
import { emailTemplate } from '../../../shared/emailTemplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { Payment } from '../payment/payment.model';
import { captureOrder, payoutToUser, stripeUserPayout } from '../payment/utils';
import { sendPushNotification } from '../../../util/onesignal';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);

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

  payload.total = payload.totalSits;

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
  userId: string;
}) => {
  const { lat, lon, days, search, country, userId } = query;

  const pipeline: any[] = [];

  // Geo query
  if (lat && lon) {
    pipeline.push({
      $geoNear: {
        near: {
          type: 'Point',
          coordinates: [lon, lat],
        },
        distanceField: 'distance',
        spherical: true,
        distanceMultiplier: 0.001,
      },
    });
  }

  const matchConditions: any = {};

  // Always exclude expired parties (before today)
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  if (days) {
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + days);
    futureDate.setHours(23, 59, 59, 999);

    matchConditions.partyDate = {
      $gte: today,
      $lte: futureDate,
    };
  } else {
    matchConditions.partyDate = { $gte: today };
  }

  if (search) {
    const safeSearch = search.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    matchConditions.partyName = {
      $regex: `.*${safeSearch}.*`,
      $options: 'i',
    };
  }

  if (country) {
    const safeCountry = country.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
    matchConditions.country = {
      $regex: `.*${safeCountry}.*`,
      $options: 'i',
    };
  }

  if (Object.keys(matchConditions).length > 0) {
    pipeline.push({ $match: matchConditions });
  }

  if (pipeline.length === 0) {
    pipeline.push({ $match: {} });
  }

  // Lookup user details
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
    $unwind: {
      path: '$userId',
      preserveNullAndEmptyArrays: true,
    },
  });

  // Lookup participants
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

  // Check if the user has saved the party
  pipeline.push({
    $lookup: {
      from: 'savedparties',
      let: { partyId: '$_id' },
      pipeline: [
        {
          $match: {
            $expr: {
              $and: [
                { $eq: ['$partyId', '$$partyId'] },
                { $eq: ['$userId', new mongoose.Types.ObjectId(userId)] },
              ],
            },
          },
        },
      ],
      as: 'savedStatus',
    },
  });

  // Add isSaved field
  pipeline.push({
    $addFields: {
      isSaved: { $gt: [{ $size: '$savedStatus' }, 0] },
    },
  });

  // Remove savedStatus from final output
  pipeline.push({
    $project: {
      savedStatus: 0,
    },
  });

  const parties = await Party.aggregate(pipeline);
  return parties;
};

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

  const hostParties = await Party.find({ userId })
    .populate([
      { path: 'participants', select: 'name email image' },
      { path: 'userId', select: 'name email image' },
    ])
    .sort({ createdAt: -1 })
    .lean();

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

interface JoinPartyPayload {
  partyId: string;
  ticket: number;
  amount: number;
  orderId: string;
  paymentMethod?: 'PAYPAL' | 'STRIPE';
}

const joinParty = async (userId: string, payload: JoinPartyPayload) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const [userExists, party] = await Promise.all([
      User.isExistUserById(userId),
      Party.findById(payload.partyId).session(session),
    ]);
    if (!userExists)
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
    if (!party) throw new AppError(StatusCodes.NOT_FOUND, 'Party not found');
    if (!party.participants) party.participants = [];

    // get host info
    const partyHost = await User.findById(party.userId).lean();

    // Seat availability
    if (party.totalSits < payload.ticket) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Not enough seats');
    }

    // Already participant?
    if (party.participants.some(p => p.toString() === userId)) {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Already a participant');
    }

    // Capture payment from PayPal (full amount goes to admin)

    let captureId: string;
    let captureStatus: string;
    let paypalEmail: string | undefined;

    // if payment method is PayPal
    if (payload.paymentMethod === 'PAYPAL') {
      const captureResponse = await captureOrder(payload.orderId);
      if (!captureResponse || captureResponse.status !== 'COMPLETED') {
        throw new AppError(
          StatusCodes.PAYMENT_REQUIRED,
          'Payment not completed',
        );
      }

      // Extract capture details
      captureId = captureResponse.purchase_units[0].payments.captures[0].id;
      paypalEmail = captureResponse.payer?.email_address;
      captureStatus = captureResponse.status;

      // Save user paypal email (optional)
      await User.findByIdAndUpdate(
        userId,
        { paypalAccount: paypalEmail },
        { session },
      );
    } else if (payload.paymentMethod === 'STRIPE') {
      captureId = payload.orderId;
      captureStatus = 'COMPLETED';
      paypalEmail = undefined;
    } else {
      throw new AppError(StatusCodes.BAD_REQUEST, 'Invalid payment method');
    }

    // Save payment record
    await Payment.create({
      userId,
      partyId: payload.partyId,
      status: captureStatus,
      transactionId: captureId,
      amount: payload.amount,
      paymentMethod: payload.paymentMethod,
    });

    // Update party income by 90% of amount (host's income)
    const hostAmount = +(payload.amount * 0.85).toFixed(2);
    party.income += hostAmount;

    // Update party participants, seats, sold tickets
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

        // send push notification to all participants about new member
        const message = `${userExists?.name || 'new member'} joined the party: ${party.partyName}`;
        const memberUserIds = chatGroup.members?.map(m =>
          m.userId.toString(),
        ) as string[];
        const memberUsers = await User.find({ _id: { $in: memberUserIds } })
          .select('playerId')
          .lean();
        const playerIds = memberUsers.map(u => u.playerId).flat() as string[];
        await sendPushNotification(
          playerIds,
          partyHost?.name || 'Host',
          message,
        );
      }
      party.participants.push(new mongoose.Types.ObjectId(userId));
      party.totalSits -= payload.ticket;
      party.soldTicket += payload.ticket;

      await party.save({ session });
      await session.commitTransaction();
      return party;
    }

    // No chat group, create one
    const result = await ChatGroup.create(
      [
        {
          partyId: payload.partyId,
          groupName: party.partyName,
          members: [
            { userId, ticket: payload.ticket, limit: payload.ticket },
            { userId: party.userId, ticket: 0, limit: 0 }, // Add party host as member
          ],
        },
      ],
      { session },
    );

    const gp = await ChatGroup.findById(result[0]._id).session(session);
    if (!gp) {
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error creating chat group!',
      );
    }

    const today = dayjs().utc().startOf('day');
    const partyDate = dayjs(party.partyDate).utc().startOf('day');

    const diffDays = partyDate.diff(today, 'day'); 
  
    if (diffDays >= 0 && diffDays <= 7 && !gp.isActive) {
      gp.isActive = true;
      await gp.save({ session });
    }

    party.participants.push(new mongoose.Types.ObjectId(userId));
    party.totalSits -= payload.ticket;
    party.soldTicket += payload.ticket;
    await party.save({ session });

    // send the confirmation email to the user

    const finalAmount = payload.amount * 0.85; // host income after 15% deduction

    const emailValues: IPartyJoinConfirmation = {
      email: userExists.email,
      partyName: party.partyName,
      partyDate: party.partyDate
        ? party.partyDate.toISOString().split('T')[0]
        : '',
      ticketCount: payload.ticket,
      totalPrice: finalAmount.toFixed(2),
    };

    // Send email to host
    const hostConfermationMail =
      emailTemplate.partyJoinedConfirmation(emailValues);
    emailHelper.sendEmail(hostConfermationMail);

    // send push notification to party host about new participant
    const message = `${userExists?.name || 'new participant'} joined your party: ${party.partyName}`;
    await sendPushNotification(
      partyHost?.playerId as string[],
      partyHost?.name || 'Host',
      message,
    );

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

    if (!isUserExist)
      throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
    if (!isPartyExist)
      throw new AppError(StatusCodes.NOT_FOUND, 'Party not found!');

    const partyHost = await User.findById(isPartyExist.userId).lean();

    const currentDate = new Date();
    const partyDate = new Date(isPartyExist.partyDate);
    const hoursDifference = Math.ceil(
      (partyDate.getTime() - currentDate.getTime()) / 36_00_000,
    );

    if (hoursDifference < 72) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'Cannot leave party within 72 hours of the event!',
      );
    }

    const isParticipant = isPartyExist.participants?.some(
      participantId => participantId._id.toString() === userId.toString(),
    );
    if (!isParticipant)
      throw new AppError(StatusCodes.BAD_REQUEST, 'You are not a participant!');

    if (!chatGroup)
      throw new AppError(StatusCodes.NOT_FOUND, 'Chat group not found!');

    const userInGroup = chatGroup.members.find(
      member => member.userId.toString() === userId,
    );
    if (!userInGroup)
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'User not found in chat group!',
      );

    const ticketsToReturn = userInGroup.ticket;
    const refundAmount = +(
      ticketsToReturn *
      isPartyExist.partyFee *
      0.95
    ).toFixed(2); // 95% refund amount

    // Issue payout refund from admin account to user

    const userPaypalEmail = await User.findById(userId)
      .select('paypalAccount')
      .lean();
    if (!userPaypalEmail?.paypalAccount) {
      throw new AppError(
        StatusCodes.BAD_REQUEST,
        'User PayPal email not found for refund!',
      );
    }

    const paymentInfo = await Payment.findOne({ userId, partyId }).lean();

    if (!paymentInfo) {
      throw new AppError(
        StatusCodes.NOT_FOUND,
        'Payment information not found for the user!',
      );
    }

    // if payment method is PayPal

    if (paymentInfo.paymentMethod === 'PAYPAL') {
      await payoutToUser(
        userPaypalEmail.paypalAccount,
        refundAmount,
        isPartyExist.partyName,
        partyId,
        userId,
      );
    } else if (paymentInfo.paymentMethod === 'STRIPE') {
      // amount, stripeAccountId, description
      // stripeAccountId,
      //   description,
      //   userId,
      //   partyId,
      //   receiverEmail,
      //   stripePayoutId;
      const info = {
        amount: refundAmount,
        stripeAccountId: isUserExist.stripeAccountId!,
        description: `Refund for leaving party: ${isPartyExist.partyName}`,
        userId,
        partyId,
        receiverEmail: userPaypalEmail.paypalAccount,
        stripePayoutId: paymentInfo.transactionId,
      };
      await stripeUserPayout(info);
    }

    // Update chat group and party accordingly
    await ChatGroup.findByIdAndUpdate(
      chatGroup._id,
      { $pull: { members: { userId: new mongoose.Types.ObjectId(userId) } } },
      { new: true, session },
    );

    const incomeToDeduct = ticketsToReturn * isPartyExist.partyFee * 0.95; // Deduct host income

    const updatedParty = await Party.findByIdAndUpdate(
      partyId,
      {
        $pull: { participants: userId },
        $inc: {
          totalSits: ticketsToReturn,
          soldTicket: -ticketsToReturn,
          income: -incomeToDeduct,
        },
      },
      { new: true, session },
    );

    if (!updatedParty)
      throw new AppError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        'Error updating party!',
      );

    // send push notification to host about participant leaving
    const message = `${isUserExist?.name || 'user'} leave from the party: ${isPartyExist.partyName}`;
    await sendPushNotification(
      partyHost?.playerId as string[],
      partyHost?.name || 'Host',
      message,
    );

    await session.commitTransaction();
    return updatedParty;
  } catch (error) {
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
};

const upcomingParties = async (userId: string) => {
  const isUserExist = await User.isExistUserById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  const todayStr = new Date().toISOString().split('T')[0];
  const parties = await Party.find({
    partyDate: {
      $gte: todayStr,
    },
    participants: new Types.ObjectId(userId), // <== this ensures user is included
  })
    .populate([
      { path: 'participants', select: 'name email image' },
      { path: 'userId', select: 'name email image' },
    ])
    .lean();

  return parties;
};

const pastParties = async (userId: string) => {
  const isUserExist = await User.isExistUserById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  const today = new Date();

  const startDateStr = today.toISOString().split('T')[0];

  const parties = await Party.find({
    partyDate: {
      $lt: startDateStr,
    },
    participants: new Types.ObjectId(userId), // <== this ensures user is included
  })
    .populate([
      { path: 'participants', select: 'name email image' },
      { path: 'userId', select: 'name email image' },
    ])
    .lean();

  return parties;
};

const paidParties = async (userId: string) => {
  const isUserExist = await User.isExistUserById(userId);
  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  const parties = await Party.find({
    participants: new Types.ObjectId(userId), // <== this ensures user is included
  })
    .populate([
      { path: 'participants', select: 'name email image' },
      { path: 'userId', select: 'name email image' },
    ])
    .lean();

  return parties;
};

const saveStatus = async (
  userId: string,
  partyId: string,
): Promise<boolean> => {
  const isSaved = await SavedParty.exists({
    userId: new mongoose.Types.ObjectId(userId),
    partyId: new mongoose.Types.ObjectId(partyId),
  });

  return !!isSaved; // true if exists, false otherwise
};

const getAllParties = async (
  userId: string,
  query: Record<string, unknown>,
) => {
  const { page, limit } = query;
  const currentPage = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 10;
  const skip = (currentPage - 1) * pageSize;

  const isUserExist = await User.isExistUserById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  if (isUserExist.role !== 'ADMIN') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to view all parties!',
    );
  }

  const parties = await Party.find({})
    .populate([
      { path: 'participants', select: 'name email image' },
      { path: 'userId', select: 'name email image' },
    ])
    .skip(skip)
    .limit(pageSize)
    .lean();
  const totalPages = Math.ceil((await Party.countDocuments()) / pageSize);
  const totalData = await Party.countDocuments();

  return {
    data: parties,
    meta: {
      totalData,
      totalPages,
      currentPage,
      pageSize,
    },
  };
};

export const PartyService = {
  createParyty,
  updateParty,
  getNearbyParties,
  getSingleParty,
  getAllPartiesByHost,
  joinParty,
  leaveParty,
  upcomingParties,
  pastParties,
  paidParties,
  saveStatus,
  getAllParties,
};

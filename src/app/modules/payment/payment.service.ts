import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';
import { stripe } from './utils';
import { Party } from '../party/party.model';
import mongoose from 'mongoose';

const createStripePaymentIntent = async (
  userId: string,
  partyId: string,
  amount: number,
  email: string,
) => {
  if (!partyId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'missing partyId');
  }
  if (!userId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'missing  userId');
  }

  if (!amount) {
    throw new AppError(StatusCodes.NOT_FOUND, 'missing amount');
  }

  // Check if the party has available seats and if the user is already a participant
  const party = await Party.findById(partyId);
  if (!party) {
    throw new Error('Party not found');
  }

  if (party.soldTicket >= party.totalSits) {
    throw new Error('No available seats for this party');
  }

  const id = new mongoose.Types.ObjectId(userId);

  if (party?.participants?.includes(id)) {
    throw new Error('User has already joined this party');
  }

  try {
    const lineItems = [
      {
        price_data: {
          currency: 'GBP',
          product_data: {
            name: 'Party Payment',
            description: `Payment for party ${partyId}`,
          },
          unit_amount: amount * 100,
        },
        quantity: 1,
      },
    ];

    //TODO: change success_url and cancel_url later

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: 'https://api.usedistraction.com',

      cancel_url: 'https://api.usedistraction.com/cancel',
      metadata: {
        userId,
        partyId,
      },
      customer_email: email,
    });

    return session.url;
  } catch (error) {
    throw new Error('Failed to create checkout session');
  }
};

const allPayments = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const currentPage = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 10;
  const skip = (currentPage - 1) * pageSize;

  const totalData = await Payment.countDocuments();
  const totalPages = Math.ceil(totalData / pageSize);

  const totalAmountResult = await Payment.aggregate([
    { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
  ]);
  const totalAmount =
    totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

  const data = await Payment.find({})
    .populate('userId', 'name email paypalAccount')
    .populate('partyId', 'name paypalAccount')
    .skip(skip)
    .limit(pageSize)
    .lean();

  return {
    data,
    meta: {
      totalData,
      totalPages,
      currentPage,
      pageSize,
      totalAmount,
    },
  };
};

const singlePayment = async (id: string) => {
  const isExist = await Payment.findById(id)
    .populate('userId', 'name email paypalAccount')
    .populate('partyId', 'partyName  paypalAccount')
    .lean();

  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'this payment does not exist');
  }

  return isExist;
};

export const PaymentService = {
  createStripePaymentIntent,
  allPayments,
  singlePayment,
};

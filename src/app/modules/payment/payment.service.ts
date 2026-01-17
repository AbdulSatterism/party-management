import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';
import { stripe } from './utils';
import { Party } from '../party/party.model';
import mongoose from 'mongoose';
import { logger } from '../../../shared/logger';
import { Stripe } from 'stripe';
import { User } from '../user/user.model';
import { ChatGroup } from '../chatGroup/chatGroup.model';
import { sendPushNotification } from '../../../util/onesignal';
import { IPartyJoinConfirmation } from '../../../types/emailTamplate';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';

const createStripePaymentIntent = async (
  userId: string,
  partyId: string,
  amount: number,
  ticket: number,
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
    throw new AppError(StatusCodes.NOT_FOUND, 'Party not found');
  }

  if (ticket > party.totalSits) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'No available seats for this party',
    );
  }

  const id = new mongoose.Types.ObjectId(userId);

  if (party?.participants?.includes(id)) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'User has already joined this party',
    );
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
        quantity: ticket,
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
        amount,
        ticket,
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

// handle webhook

const handleStripeWebhookService = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object as Stripe.Checkout.Session;

      const { amount_total, metadata, payment_intent } = session;

      const userId = metadata?.userId;
      const partyId = metadata?.partyId;
      const amount = metadata?.amount;
      const ticket = metadata?.ticket;

      const amountTotal = (amount_total ?? 0) / 100;

      try {
        const [userExists, party] = await Promise.all([
          User.isExistUserById(userId!),
          Party.findById(partyId),
        ]);
        if (!userExists)
          throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
        if (!party)
          throw new AppError(StatusCodes.NOT_FOUND, 'Party not found');
        if (!party.participants) party.participants = [];

        // get host info
        const partyHost = await User.findById(party.userId).lean();

        // Seat availability
        if ((party.totalSits as number) < Number(ticket)) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Not enough seats');
        }

        // Already participant?
        if (party.participants.some(p => p.toString() === userId)) {
          throw new AppError(StatusCodes.BAD_REQUEST, 'Already a participant');
        }

        // Save payment record
        await Payment.create({
          userId,
          partyId: partyId,
          status: 'COMPLETED',
          transactionId: payment_intent,
          amount: amountTotal,
          paymentMethod: 'STRIPE',
        });

        // Update party income by 90% of amount (host's income)
        const hostAmount = +(amountTotal * 0.85).toFixed(2);

        await Party.findByIdAndUpdate(partyId, {
          $inc: { income: hostAmount },
        });

        // Update party participants, seats, sold tickets
        const chatGroup = await ChatGroup.findOne({
          partyId: partyId,
        });

        if (chatGroup) {
          if (!chatGroup.members.some(m => m.userId.toString() === userId)) {
            chatGroup.members.push({
              userId: new mongoose.Types.ObjectId(userId),
              ticket: Number(ticket),
              limit: Number(ticket),
            });
            await chatGroup.save();

            // send push notification to all participants about new member
            const message = `${userExists?.name || 'new member'} joined the party: ${party.partyName}`;
            const memberUserIds = chatGroup.members?.map(m =>
              m.userId.toString(),
            ) as string[];
            const memberUsers = await User.find({ _id: { $in: memberUserIds } })
              .select('playerId')
              .lean();
            const playerIds = memberUsers
              .map(u => u.playerId)
              .flat() as string[];
            await sendPushNotification(
              playerIds,
              partyHost?.name || 'Host',
              message,
            );
          }
          party.participants.push(new mongoose.Types.ObjectId(userId));
          party.totalSits -= Number(ticket);
          party.soldTicket += Number(ticket);

          await Party.findByIdAndUpdate(partyId, {
            participants: party.participants,
            totalSits: party.totalSits,
            soldTicket: party.soldTicket,
          });
          return party;
        }

        // No chat group, create one
        await ChatGroup.create([
          {
            partyId: partyId,
            groupName: party.partyName,
            members: [
              { userId, ticket: Number(ticket), limit: Number(ticket) },
              { userId: party.userId, ticket: 0, limit: 0 }, // Add party host as member
            ],
          },
        ]);

        party.participants.push(new mongoose.Types.ObjectId(userId));
        party.totalSits -= Number(ticket);
        party.soldTicket += Number(ticket);
        await Party.findByIdAndUpdate(partyId, {
          participants: party.participants,
          totalSits: party.totalSits,
          soldTicket: party.soldTicket,
        });

        // send the confirmation email to the user

        const finalAmount = Number(amount) * 0.85; // host income after 15% deduction

        const emailValues: IPartyJoinConfirmation = {
          email: userExists.email,
          partyName: party.partyName,
          partyDate: party.partyDate
            ? party.partyDate.toISOString().split('T')[0]
            : '',
          ticketCount: Number(ticket),
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

        return party;
      } catch (error) {
        logger.error(
          { error, eventType: event.type },
          'Webhook processing failed',
        );
        throw new AppError(
          StatusCodes.INTERNAL_SERVER_ERROR,
          'Failed to process checkout session',
        );
      }
    }

    case 'checkout.session.async_payment_failed': {
      const session = event.data.object as Stripe.Checkout.Session;
      const { client_secret } = session;
      const payment = await Payment.findOne({ client_secret });
      if (payment) {
        payment.status = 'FAILED';
        await payment.save();
      }

      break;
    }

    default:
      logger.warn(`Unhandled event type ${event.type}`);
      break;
  }
};

export const PaymentService = {
  createStripePaymentIntent,
  allPayments,
  singlePayment,
  handleStripeWebhookService,
};

/* eslint-disable @typescript-eslint/no-explicit-any */
import config from '../../../config';
import axios from 'axios';
import { Buffer } from 'buffer';
import { errorLogger } from '../../../shared/logger';
import { PayoutUserService } from '../payoutUser/payoutUser.service';
import mongoose from 'mongoose';
import { Party } from '../party/party.model';
import Stripe from 'stripe';
import { HostPayoutService } from '../payoutHost/payoutHost.service';

export const stripe = new Stripe(config.payment.stripe_secret_key!, {
  apiVersion: '2025-01-27.acacia',
});

const clientId = config.paypal.client_id!;
const clientSecret = config.paypal.client_secret!;

// Get PayPal access token
const getPayPalAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await axios.post(
    'https://api-m.paypal.com/v1/oauth2/token', // Use live endpoint for production
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );

  return response.data.access_token;
};

// Capture PayPal order payment
export const captureOrder = async (orderId: string) => {
  const accessToken = await getPayPalAccessToken();
  const response = await axios.post(
    `https://api-m.paypal.com/v2/checkout/orders/${orderId}/capture`, // Use live endpoint for production
    {}, // empty body required
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

export const payoutToHost = async (
  receiverEmail: string,
  amount: number,
  partyName: string,
  partyId: string,
) => {
  const accessToken = await getPayPalAccessToken();

  const payoutBody = {
    sender_batch_header: {
      sender_batch_id: `payout_${Date.now()}_${partyId}`,
      email_subject: 'You have a payout for your party',
      email_message: `Hello! You have received a payout for your party: ${partyName}`,
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: amount.toFixed(2),
          currency: 'GBP',
        },
        receiver: receiverEmail,
        note: `Payout for party host: ${partyName}`,
        sender_item_id: `item_${Date.now()}`,
      },
    ],
  };

  try {
    const response = await axios.post(
      'https://api-m.paypal.com/v1/payments/payouts', // Use api-m for REST v2 payouts
      payoutBody,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      },
    );
    return response.data;
  } catch (error: any) {
    errorLogger.error(
      'PayPal payout error:',
      error.response?.data || error.message,
    );
    throw error;
  }
};

// Refund user when leaving party >7 days before party date
export const payoutToUser = async (
  receiverEmail: string,
  amount: number,
  partyName: string,
  partyId: string,
  userId: string,
) => {
  const accessToken = await getPayPalAccessToken();

  const payoutBody = {
    sender_batch_header: {
      sender_batch_id: `refund_${Date.now()}_${partyId}`,
      email_subject: 'Refund for leaving party',
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: amount.toFixed(2),
          currency: 'GBP',
        },
        receiver: receiverEmail,
        note: `Refund for leaving party: ${partyName}`,
        sender_item_id: `item_${Date.now()}`,
      },
    ],
  };

  const response = await axios.post(
    'https://api-m.paypal.com/v1/payments/payouts', // live endpoint for production
    payoutBody,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const paypalBatchId = response.data.batch_header?.payout_batch_id;

  // Save payout info after successful payout
  await PayoutUserService.createUserPayout({
    userId: new mongoose.Types.ObjectId(userId),
    partyId: new mongoose.Types.ObjectId(partyId),
    email: receiverEmail,
    amount,
    status: 'COMPLETED',
    paypalBatchId,
    note: `Refund for leaving party: ${partyName}`,
  });

  return response.data;
};

export const createPaymentIntent = async (
  partyId: string,
  userId: string,
  amount: string,
) => {
  const accessToken = await getPayPalAccessToken();

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

  // Create PayPal Order
  const response = await axios.post(
    'https://api-m.paypal.com/v2/checkout/orders', // Use live endpoint for production
    {
      intent: 'CAPTURE',
      purchase_units: [
        {
          amount: {
            currency_code: 'GBP',
            value: amount,
          },
        },
      ],
      application_context: {
        return_url: 'http://localhost:5173',
        cancel_url: 'https://your-frontend-url.com/payment-cancel',
      },
    },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  const approvalLink = response.data.links.find(
    (link: any) => link.rel === 'approve',
  );
  if (!approvalLink) {
    throw new Error('No approval link found');
  }

  return approvalLink.href;
};

// for stripe =>

export const getStripeAccountId = async (
  email: string | undefined = undefined,
): Promise<string> => {
  const stripeAccount = await stripe.accounts.create({
    type: 'express',
    email,
    capabilities: {
      transfers: { requested: true },
    },
  });

  return stripeAccount.id;
};

//  receiverEmail: string,
//   amount: number,
//   partyName: string,
//   partyId: string,
export const stripeUserPayout = async ({
  amount,
  stripeAccountId,
  description,
  userId,
  partyId,
  receiverEmail,
  stripePayoutId,
}: {
  amount: number;
  stripeAccountId: string;
  description: string | undefined;
  userId: string;
  partyId: string;
  receiverEmail: string;
  stripePayoutId: string;
}) => {
  // create a transfer to the connected account
  await stripe.transfers.create({
    amount: amount * 100, // convert to cents
    currency: 'usd',
    destination: stripeAccountId,
    description,
  });

  // create a payout to the connected account
  await stripe.payouts.create(
    { amount: amount * 100, currency: 'usd' },
    { stripeAccount: stripeAccountId },
  );

  // Save payout info after successful payout
  await PayoutUserService.createUserPayout({
    userId: new mongoose.Types.ObjectId(userId),
    partyId: new mongoose.Types.ObjectId(partyId),
    email: receiverEmail,
    amount,
    status: 'COMPLETED',
    stripePayoutId: stripePayoutId,
    note: 'Refund for leaving party',
  });
};

export const stripeHostPayout = async ({
  amount,
  stripeAccountId,
  description,
  userId,
  partyId,
  receiverEmail,
}: {
  amount: number;
  stripeAccountId: string;
  description: string | undefined;
  userId: string;
  partyId: string;
  receiverEmail: string;
}) => {
  // create a transfer to the connected account
  await stripe.transfers.create({
    amount: amount * 100, // convert to cents
    currency: 'usd',
    destination: stripeAccountId,
    description,
  });

  // create a payout to the connected account
  const payout = await stripe.payouts.create(
    { amount: amount * 100, currency: 'usd' },
    { stripeAccount: stripeAccountId },
  );

  // Save payout info after successful payout
  await HostPayoutService.createHostPayout({
    userId: new mongoose.Types.ObjectId(userId),
    partyId: new mongoose.Types.ObjectId(partyId),
    email: receiverEmail,
    amount,
    status: 'COMPLETED',
    stripePayoutId: payout.id,
    note: 'Refund for leaving party',
  });
};

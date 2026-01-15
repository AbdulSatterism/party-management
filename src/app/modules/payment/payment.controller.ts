/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentService } from './payment.service';
import { createPaymentIntent, stripe } from './utils';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import config from '../../../config';

const createStripePaymentIntent = catchAsync(async (req, res) => {
  const userId: string = req.user.id;
  const email: string = req.user.email;

  const { partyId, ticket, amount } = req.body;

  const sessionUrl = await PaymentService.createStripePaymentIntent(
    userId,
    partyId,
    amount,
    ticket,
    email,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Stripe payment intent created successfully',
    data: sessionUrl,
  });
});

const createPayment = catchAsync(async (req, res) => {
  const userId = req?.user?.id;

  const { partyId, amount } = req.body;

  // Validate input
  if (!partyId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'missing partyId');
  }
  if (!userId) {
    throw new AppError(StatusCodes.NOT_FOUND, 'missing  userId');
  }

  if (!amount) {
    throw new AppError(StatusCodes.NOT_FOUND, 'missing amount');
  }

  // Get PayPal payment link
  const paymentUrl = await createPaymentIntent(partyId, userId, amount);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'payment intent created successfully',
    data: paymentUrl,
  });
});

const allPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.allPayments(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all payment returns successfully',
    data: result,
  });
});

const singlePayment = catchAsync(async (req, res) => {
  const result = await PaymentService.singlePayment(req?.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'user payment returns successfully',
    data: result,
  });
});

const stripeConnect = catchAsync(async ({ query }, res) => {
  await User.updateOne(
    {
      _id: query.userId,
    },
    {
      $set: {
        isStripeConnected: true,
      },
    },
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Stripe account connected successfully',
  });
});

const paymentStripeWebhookController = catchAsync(async (req, res) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.payment.stripe_webhook_secret as string,
    );

    await PaymentService.handleStripeWebhookService(event);

    res.status(200).send({ received: true });
  } catch (err: any) {
    {
      res.status(400).send(`Webhook Error: ${err.message}`);
    }
  }
});

export const PaymentController = {
  createStripePaymentIntent,
  allPayment,
  singlePayment,
  createPayment,
  stripeConnect,
  paymentStripeWebhookController,
};

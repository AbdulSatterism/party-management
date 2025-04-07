import { Request, Response } from 'express';
import config from '../../../config';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { StatusCodes } from 'http-status-codes';
import { SubscriptationService } from './subscription.service';
import stripe from '../payment/utils';

const createCheckoutSessionController = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const { packageId } = req.body;
  try {
    const sessionUrl = await SubscriptationService.createCheckoutSessionService(
      userId,
      packageId,
    );
    res.status(200).json({ url: sessionUrl });
  } catch (error) {
    res.status(500).json({ message: 'Failed to create checkout session' });
  }
};

const subscriptionStripeWebhookController = async (
  req: Request,
  res: Response,
) => {
  const sig = req.headers['stripe-signature'];

  try {
    const event = stripe.webhooks.constructEvent(
      req.body,
      sig as string,
      config.payment.stripe_webhook_secret as string,
    );

    await SubscriptationService.handleStripeWebhookService(event);

    res.status(200).send({ received: true });
  } catch (err) {
    console.error('Error in Stripe webhook');
    res.status(400).send(`Webhook Error:`);
  }
};

const getSpecificUserSubscription = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user.id;

    const result =
      await SubscriptationService.getSpecificUserSubscription(userId);
    sendResponse(res, {
      success: true,
      statusCode: StatusCodes.OK,
      message: 'Subscriptation retrived successfully',
      data: result,
    });
  },
);

const cancelSubscriptation = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const result = await SubscriptationService.cancelSubscriptation(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriptation canceled successfully',
    data: result,
  });
});

const getAllSubs = catchAsync(async (req: Request, res: Response) => {
  const result = await SubscriptationService.getAllSubs(req.query);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriptation retrived successfully',
    data: result,
  });
});

const updateSubs = catchAsync(async (req: Request, res: Response) => {
  const userId = req.user.id;

  const { newPackageId } = req.body;

  const result = await SubscriptationService.updateSubscriptionPlanService(
    userId,
    newPackageId,
  );
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Subscriptation updated successfully',
    data: result,
  });
});

const getSingleSubscriptionDetails = catchAsync(async (req, res) => {
  const result = await SubscriptationService.getSingleSubscriptionDetails(
    req.params.id,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'single subscription retrive successfully',
    data: result,
  });
});

export const SubscriptionController = {
  createCheckoutSessionController,
  subscriptionStripeWebhookController,
  getSpecificUserSubscription,
  cancelSubscriptation,
  getAllSubs,
  updateSubs,
  getSingleSubscriptionDetails,
};

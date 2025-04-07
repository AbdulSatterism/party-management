/* eslint-disable @typescript-eslint/no-explicit-any */
import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiError';
import { Package } from '../package/package.model';
import { User } from '../user/user.model';
import Stripe from 'stripe';
import { WebhookService } from '../../../shared/webhook';
import stripe from '../payment/utils';
import { Subscription } from './subscription.model';

const createCheckoutSessionService = async (
  userId: string,
  packageId: string,
) => {
  const isUser = await User.findById(userId);

  try {
    const plan = await Package.findById(packageId);
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
    }

    // Create a checkout session for a subscription
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: plan.priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url:
        'https://yourapp.com/success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://yourapp.com/cancel',
      metadata: {
        userId,
        packageId,
      },
      customer_email: isUser?.email,
    });

    // Return the checkout session URL
    return session.url;
  } catch (error) {
    throw new Error('Failed to create checkout session');
  }
};

const handleStripeWebhookService = async (event: Stripe.Event) => {
  switch (event.type) {
    case 'checkout.session.completed':
      WebhookService.handleCheckoutSessionCompleted(event.data.object);
      break;

    case 'invoice.payment_succeeded':
      WebhookService.handleInvoicePaymentSucceeded(event.data.object);
      break;

    case 'invoice.payment_failed':
      WebhookService.handleInvoicePaymentFailed(event.data.object);
      break;

    case 'checkout.session.async_payment_failed':
      WebhookService.handleAsyncPaymentFailed(event.data.object);
      break;

    case 'customer.subscription.deleted':
      WebhookService.handleSubscriptionDeleted(event.data.object);
      break;

    default:
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid event type');
  }
};

const getSpecificUserSubscription = async (userId: string) => {
  const isUser = await User.findById(userId);

  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  const subscription = await Subscription.findOne({ user: userId })
    .populate({
      path: 'user',
      select: 'name email subscription',
    })
    .populate({
      path: 'package',
      select: 'name interval unitAmount',
    });

  if (!subscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscribtion not found');
  }
  return subscription;
};

const cancelSubscriptation = async (userId: string) => {
  const isUser = await User.findById(userId);

  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  const subscription = await Subscription.findOne({ user: userId });
  if (!subscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscribtion not found');
  }

  const updatedSubscription = await stripe.subscriptions.update(
    subscription.subscriptionId,
    {
      cancel_at_period_end: true,
    },
  );

  if (!updatedSubscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscribtion not cancel');
  }

  const updatedSub = await Subscription.findOneAndUpdate(
    { user: userId },
    { status: 'cancel' },
    { new: true },
  );
  return updatedSub;
};

//* by admin
const getAllSubs = async (query: Record<string, unknown>) => {
  const { page, limit } = query;

  const anyConditions: any[] = [{ status: 'active' }];

  const whereConditions =
    anyConditions.length > 0 ? { $and: anyConditions } : {};

  // Pagination setup
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  // Fetch campaigns
  const result = await Subscription.find(whereConditions)
    .populate('user', 'name email')
    .populate('package', 'name unitAmount interval')
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await Subscription.countDocuments(whereConditions);
  const totalAmount = Number(
    result.reduce((sum, sub) => sum + (sub.amount || 0), 0).toFixed(2),
  );

  return {
    result,
    page: pages,
    totalSubscription: count,
    totalAmount,
  };
};

const updateSubscriptionPlanService = async (
  userId: string,
  newPackageId: string,
) => {
  // Step 1: Fetch the user
  const isUser = await User.findById(userId);
  if (!isUser) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'User not found');
  }

  // Step 2: Fetch the user's subscription
  const subscription = await Subscription.findOne({ user: userId });
  if (!subscription) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Subscription not found');
  }

  // Step 3: Fetch the new plan details
  const newPlan = await Package.findById(newPackageId);
  if (!newPlan) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'New plan not found');
  }

  // Step 4: Fetch the current subscription from Stripe
  const stripeSubscription = await stripe.subscriptions.retrieve(
    subscription.subscriptionId,
  );

  if (!stripeSubscription) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Stripe subscription not found',
    );
  }

  // Step 5: Update the subscription in Stripe
  const updatedStripeSubscription = await stripe.subscriptions.update(
    subscription.subscriptionId,
    {
      items: [
        {
          id: stripeSubscription.items.data[0].id,
          price: newPlan.priceId, // The new plan's price ID
        },
      ],
      proration_behavior: 'create_prorations', // Optional: set based on your requirements
    },
  );

  if (!updatedStripeSubscription) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      'Stripe subscription update failed',
    );
  }

  // Step 6: Retrieve the upcoming invoice to calculate proration
  const invoicePreview = await stripe.invoices.retrieveUpcoming({
    customer: updatedStripeSubscription.customer as string,
    subscription: updatedStripeSubscription.id,
  });

  const prorationAmount = (invoicePreview.total || 0) / 100;

  // Step 7: Update the local database with the actual charged amount (proration)
  const updatedSub = await Subscription.findByIdAndUpdate(
    subscription._id,
    {
      package: newPackageId,
      amount: prorationAmount,
      time: newPlan.interval,
      startDate: new Date(invoicePreview.period_start * 1000),
      endDate: new Date(invoicePreview.period_end * 1000),
    },
    { new: true },
  );

  if (updatedSub) {
    updatedSub.status = 'active';
    await updatedSub.save();
  }

  return updatedSub;
};

//* by admin
const getSingleSubscriptionDetails = async (id: string) => {
  const subscriptoin = await Subscription.findById(id);

  if (!subscriptoin) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'subscrition not found');
  }

  const { subscriptionId } = subscriptoin;

  if (!subscriptionId) {
    throw new ApiError(StatusCodes.BAD_REQUEST, 'Transaction ID is missing');
  }

  //* Fetch charge details to get card details
  const stripeSubscription =
    await stripe.subscriptions.retrieve(subscriptionId);

  const subscriptionDetails = {
    id: stripeSubscription.id,
    status: stripeSubscription.status,
    currency: stripeSubscription.currency,
    interval: stripeSubscription.items.data[0]?.plan.interval,
    startDate: new Date(stripeSubscription.start_date * 1000),
    endDate: new Date(stripeSubscription.current_period_end * 1000),
  };

  return {
    ...subscriptoin.toObject(), // Convert Mongoose document to a plain object
    subscriptionDetails,
  };
};

export const SubscriptationService = {
  createCheckoutSessionService,
  handleStripeWebhookService,
  getSpecificUserSubscription,
  cancelSubscriptation,
  getAllSubs,
  updateSubscriptionPlanService,
  getSingleSubscriptionDetails,
};

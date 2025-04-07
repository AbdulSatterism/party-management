/* eslint-disable @typescript-eslint/no-explicit-any */

import { StatusCodes } from 'http-status-codes';
import stripe from '../payment/utils';
import { IPackage } from './package.interface';
import { Package } from './package.model';
import ApiError from '../../../errors/ApiError';
import { mapInterval } from './package.constant';
import mongoose from 'mongoose';

const createPackage = async (payload: Partial<IPackage>) => {
  try {
    if (
      !payload.name ||
      !payload.description ||
      !payload.unitAmount ||
      !payload.interval
    ) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Invalid package data');
    }

    const isPlanExist = await Package.findOne({ name: payload.name });

    if (isPlanExist) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'package already exist');
    }

    const descriptionString = Array.isArray(payload.description)
      ? payload.description.join(' ') // Join elements with a space
      : payload.description;

    // Create Stripe product
    const product = await stripe.products.create({
      name: payload.name,
      description: descriptionString,
    });

    // Handle recurring intervals, including custom 'half-year'
    const recurring: {
      interval: 'day' | 'week' | 'month' | 'year';
      interval_count?: number; // Optional for custom intervals
    } = {
      interval: payload.interval === 'half-year' ? 'month' : payload.interval,
    };

    if (payload.interval === 'half-year') {
      recurring.interval_count = 6; // Custom interval count for half-year
    }

    // Create Stripe price
    const price = await stripe.prices.create({
      unit_amount: payload.unitAmount * 100,
      currency: 'usd',
      recurring, // Pass the constructed recurring object
      product: product.id,
    });

    // Save plan in MongoDB
    if (price) {
      const plan = await Package.create({
        name: payload.name,
        description: payload.description,
        unitAmount: payload.unitAmount,
        interval: payload.interval,
        productId: product.id,
        priceId: price.id,
      });
      return plan;
    }
  } catch (error: any) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      `Error creating package: ${error.message}`,
    );
  }
};

const updatePackage = async (
  planId: string,
  updates: Partial<IPackage>,
): Promise<IPackage> => {
  try {
    const plan = await Package.findById(planId);
    if (!plan) {
      throw new ApiError(StatusCodes.NOT_FOUND, 'Package not found');
    }

    // Ensure description is always a string for Stripe
    const updatedDescription = Array.isArray(updates.description)
      ? updates.description.join(' ') // Join array elements if description is an array
      : updates.description; // Use as-is if it's already a string

    if (updates.name || updatedDescription) {
      await stripe.products.update(plan.productId, {
        name: updates.name || plan.name,
        description: updatedDescription,
      });
    }

    if (updates.unitAmount || updates.interval) {
      const stripeInterval = mapInterval(updates.interval || plan.interval);

      // Archive the current Stripe price before creating the new one
      if (plan.priceId) {
        await stripe.prices.update(plan.priceId, {
          active: false, // Archive the old price
        });
      }

      const newPrice = await stripe.prices.create({
        unit_amount: updates.unitAmount
          ? updates.unitAmount * 100
          : plan.unitAmount * 100,
        currency: 'usd',
        recurring: { interval: stripeInterval },
        product: plan.productId,
      });

      updates.priceId = newPrice.id; // Update with new Stripe price ID
    }

    // Update the plan in the database
    const updatedPlan = await Package.findByIdAndUpdate(planId, updates, {
      new: true,
      runValidators: true,
    });

    if (!updatedPlan) {
      throw new Error('Failed to update Package');
    }

    return updatedPlan.toObject();
  } catch (error) {
    throw new Error('Failed to update plan');
  }
};

const deletePackage = async (planId: string) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Check if the package exists
    const isExistPlan = await Package.findById(planId).session(session);
    if (!isExistPlan) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Package not found!');
    }

    // Update Stripe price to inactive
    await stripe.prices.update(isExistPlan.priceId, { active: false });

    // Delete the package
    const deleteData = await Package.findByIdAndDelete(planId).session(session);
    if (!deleteData) {
      throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to delete package');
    }

    // Commit transaction if everything is successful
    await session.commitTransaction();
    session.endSession();

    return deleteData;
  } catch (error) {
    // Rollback transaction in case of any error
    await session.abortTransaction();
    session.endSession();
    throw error;
  }
};

const allPackage = async () => {
  const result = await Package.find();

  return result;
};

//* only for admin
const singlePackage = async (id: string) => {
  const result = await Package.findById(id);

  if (!result) {
    throw new ApiError(StatusCodes.NOT_FOUND, 'package not found');
  }

  return result;
};

export const packageServices = {
  createPackage,
  updatePackage,
  deletePackage,
  allPackage,
  singlePackage,
};

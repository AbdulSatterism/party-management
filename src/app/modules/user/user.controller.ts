/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable no-unused-vars */
import { NextFunction } from 'express';
import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { UserService } from './user.service';
import getFilePath from '../../../shared/getFilePath';
import fs from 'fs';

const createUser = catchAsync(async (req, res) => {
  const value = {
    ...req.body,
  };

  await UserService.createUserFromDb(value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Please check your email to verify your account.',
  });
});

const getAllUser = catchAsync(async (req, res) => {
  const result = await UserService.getAllUsers(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all user retrieved successfully',
    data: result,
  });
});

const getUserProfile = catchAsync(async (req, res) => {
  const user = req.user;
  const result = await UserService.getUserProfileFromDB(user);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile data retrieved successfully',
    data: result,
  });
});

//update profile
const updateProfile = catchAsync(async (req, res) => {
  const user = req.user;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await UserService.updateProfileToDB(user, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Profile updated successfully',
    data: result,
  });
});

const getSingleUser = catchAsync(async (req, res) => {
  const result = await UserService.getSingleUser(req.params.id);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'User retrived successfully',
    data: result,
  });
});

// search by phone number
const searchByPhone = catchAsync(async (req, res) => {
  const searchTerm = req.query.searchTerm;
  const userId = req?.user?.id;

  const result = await UserService.searchUserByPhone(
    searchTerm as string,
    userId,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'get user by searching phone number',
    data: result,
  });
});

//! host request

const hostRequest = catchAsync(async (req, res) => {
  const user = req.user;

  let passport;
  let residential;

  if (req.files && 'passport' in req.files && req.files.passport[0]) {
    passport = `/docs/${req.files.passport[0].filename}`;
  }

  if (req.files && 'residential' in req.files && req.files.residential[0]) {
    residential = `/docs/${req.files.residential[0].filename}`;
  }

  const value = {
    passport,
    residential,
    ...req.body,
  };

  console.log(value);

  const result = await UserService.hostRequest(user, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Host request send successfully',
    data: result,
  });
});

//* get all host request by admin

const getAllHostRequest = catchAsync(async (req, res) => {
  const result = await UserService.getAllHostRequest(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All host request retrieved successfully',
    data: result,
  });
});

///* rejected host request

const getAllRejectedHostRequest = catchAsync(async (req, res) => {
  const result = await UserService.getAllRejectedHostRequest(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All host request retrieved successfully',
    data: result,
  });
});

//* approve host request

const approveHostRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.approvedHostRequest(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Host request approved successfully',
    data: result,
  });
});

//* reject host request

const rejectHostRequest = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await UserService.rejectedHostRequest(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Host request rejected!',
    data: result,
  });
});

//* get all host by admin

const getAllHost = catchAsync(async (req, res) => {
  const result = await UserService.getAllHost(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All host retrieved successfully',
    data: result,
  });
});

export const UserController = {
  createUser,
  getUserProfile,
  updateProfile,
  searchByPhone,
  getSingleUser,
  getAllUser,
  hostRequest,
  getAllHostRequest,
  approveHostRequest,
  rejectHostRequest,
  getAllRejectedHostRequest,
  getAllHost,
};

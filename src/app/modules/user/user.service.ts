/* eslint-disable no-undef */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { StatusCodes } from 'http-status-codes';
import { JwtPayload } from 'jsonwebtoken';
import { USER_ROLES } from '../../../enums/user';
import { emailHelper } from '../../../helpers/emailHelper';
import { emailTemplate } from '../../../shared/emailTemplate';
import generateOTP from '../../../util/generateOTP';

import { IUser } from './user.interface';
import { User } from './user.model';
import unlinkFile from '../../../shared/unlinkFile';
import AppError from '../../errors/AppError';
import QueryBuilder from '../../builder/QueryBuilder';
import { IHostApproval } from '../../../types/emailTamplate';


const createUserFromDb = async (payload: IUser) => {
  payload.role = USER_ROLES.USER;
  const result = await User.create(payload);

  if (!result) {
    throw new AppError(StatusCodes.BAD_REQUEST, 'Failed to create user');
  }

  const otp = generateOTP();
  const emailValues = {
    name: result.name || 'party',
    otp,
    email: result.email,
  };

  const accountEmailTemplate = emailTemplate.createAccount(emailValues);
  emailHelper.sendEmail(accountEmailTemplate);

  // Update user with authentication details
  const authentication = {
    oneTimeCode: otp,
    expireAt: new Date(Date.now() + 20 * 60000),
  };
  const updatedUser = await User.findOneAndUpdate(
    { _id: result._id },
    { $set: { authentication } },
  );
  if (!updatedUser) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found for update');
  }

  return result;
};

const getAllUsers = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await User.find()
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const count = await User.countDocuments();

  return {
    result,
    totalData: count,
    page: pages,
    limit: size,
  };
};

const getUserProfileFromDB = async (
  user: JwtPayload,
): Promise<Partial<IUser>> => {
  const { id } = user;
  const isExistUser = await User.findById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }



  return isExistUser;
};

const updateProfileToDB = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (!isExistUser.verified) {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'Please verify your email first',
    );
  }

  if (payload.image && isExistUser.image) {
    unlinkFile(isExistUser.image);
  }

  const updateDoc = await User.findOneAndUpdate({ _id: id }, payload, {
    new: true,
  });

  return updateDoc;
};

const getSingleUser = async (id: string): Promise<IUser | null> => {
  const result = await User.findById(id);

  if (!result) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found');
  }

  return result;
};

// search user by phone
const searchUserByPhone = async (searchTerm: string, userId: string) => {
  let result;

  if (searchTerm) {
    result = await User.find({
      phone: { $regex: searchTerm, $options: 'i' },
      _id: { $ne: userId },
    });
  } else {
    result = await User.find({ _id: { $ne: userId } }).limit(10);
  }

  return result;
};

//! host request

const hostRequest = async (
  user: JwtPayload,
  payload: Partial<IUser>,
): Promise<Partial<IUser | null>> => {
  const { id } = user;
  const isExistUser = await User.isExistUserById(id);

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.role === 'HOST') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You are already a host!');
  }

  if (isExistUser.role === 'ADMIN') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You are admin do not need to be host!',
    );
  }

  if (payload.passport && isExistUser.passport) {
    unlinkFile(isExistUser.passport);
  }
  if (payload.residential && isExistUser.residential) {
    unlinkFile(isExistUser.residential);
  }

  const updateDoc = await User.findOneAndUpdate(
    { _id: id },
    {
      $set: {
        ...payload,
        hostRequest: 'REQUESTED',
      },
    },
    { new: true },
  );

  if (!updateDoc) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error updating host request!',
    );
  }

  return updateDoc;
};

//* approved host  request by admin with id

const approvedHostRequest = async (id: string) => {
  const isExistUser = await User.isExistUserById(id);

  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.role === 'HOST') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'You are already a host!');
  }

  if (isExistUser.role === 'ADMIN') {
    throw new AppError(
      StatusCodes.BAD_REQUEST,
      'You are admin do not need to be host!',
    );
  }

  const updateDoc = await User.findOneAndUpdate(
    { _id: id },
    { $set: { role: USER_ROLES.HOST, hostRequest: 'APPROVED' } },
    { new: true },
  );

  if (!updateDoc) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'Error updating host request!',
    );
  }

  const emailValues: IHostApproval = {
    email: isExistUser.email,
    hostName: isExistUser.name || 'HOST',
  };

  // Send email to host
  const hostConfermationMail = emailTemplate.hostApproval(emailValues);
  emailHelper.sendEmail(hostConfermationMail);

  return updateDoc;
};

//* host rejected by admin

const rejectedHostRequest = async (id: string) => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  if (isExistUser.role === 'HOST') {
    throw new AppError(StatusCodes.BAD_REQUEST, 'host can not be rejected!');
  }

  const updateDoc = await User.findOneAndUpdate(
    { _id: id },
    { $set: { role: USER_ROLES.USER, hostRequest: 'REJECTED' } },
    { new: true },
  );

  if (!updateDoc) {
    throw new AppError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      'failded to reject host request',
    );
  }

  const emailValues: IHostApproval = {
    email: isExistUser.email,
    hostName: isExistUser.name || 'HOST',
  };

  // Send email to host
  const hostConfermationMail = emailTemplate.HostRejected(emailValues);
  emailHelper.sendEmail(hostConfermationMail);

  return updateDoc;
};

//* all host request by admin

const getAllHostRequest = async (query: Record<string, unknown>) => {
  const hostQuery = new QueryBuilder(
    User.find({ hostRequest: 'REQUESTED' }),
    query,
  )
    .search(['name', 'email'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const result = await hostQuery.modelQuery;
  const meta = await hostQuery.countTotal();

  return { result, meta };
};

//* get all rejected host

const getAllRejectedHostRequest = async (query: Record<string, unknown>) => {
  const hostQuery = new QueryBuilder(
    User.find({ hostRequest: 'REJECTED' }),
    query,
  )
    .search(['name', 'email'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const result = await hostQuery.modelQuery;
  const meta = await hostQuery.countTotal();

  return { result, meta };
};

//* all host by admin

const getAllHost = async (query: Record<string, unknown>) => {
  const hostQuery = new QueryBuilder(User.find({ role: 'HOST' }), query)
    .search(['name', 'email'])
    .filter()
    .sort()
    .fields()
    .paginate();

  const result = await hostQuery.modelQuery;
  const meta = await hostQuery.countTotal();

  return { result, meta };
};

// delete user

const deleteUser = async (id: string) => {
  const isExistUser = await User.isExistUserById(id);
  if (!isExistUser) {
    throw new AppError(StatusCodes.BAD_REQUEST, "User doesn't exist!");
  }

  const deleteDoc = await User.findByIdAndDelete(id);

  return deleteDoc;
};

export const UserService = {
  createUserFromDb,
  getUserProfileFromDB,
  updateProfileToDB,
  getSingleUser,
  searchUserByPhone,
  getAllUsers,
  hostRequest,
  getAllHostRequest,
  approvedHostRequest,
  rejectedHostRequest,
  getAllRejectedHostRequest,
  getAllHost,
  deleteUser,
};

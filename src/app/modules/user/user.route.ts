/* eslint-disable @typescript-eslint/no-explicit-any */
import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

import { UserController } from './user.controller';
import { UserValidation } from './user.validation';
import validateRequest from '../../middlewares/validateRequest';
const router = express.Router();

router.post(
  '/create-user',
  validateRequest(UserValidation.createUserSchema),
  UserController.createUser,
);

router.get('/all-user', auth(USER_ROLES.ADMIN), UserController.getAllUser);

router.patch(
  '/update-profile',
  fileUploadHandler(),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.HOST),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(UserValidation.updateUserProfileSchema),
  UserController.updateProfile,
);

router.get(
  '/user',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  UserController.getUserProfile,
);

router.get(
  '/get-single-user/:id',
  auth(USER_ROLES.ADMIN),
  UserController.getSingleUser,
);

// get user by search by phone
router.get(
  '/user-search',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  UserController.searchByPhone,
);

router.get(
  '/profile',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  UserController.getUserProfile,
);

//! host part

router.patch(
  '/host-request',
  fileUploadHandler(),
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body?.data ?? '{}');
    next();
  },
  UserController.hostRequest,
);

router.get(
  '/all-host-request',
  auth(USER_ROLES.ADMIN),
  UserController.getAllHostRequest,
);

router.get(
  '/all-rejected-host',
  auth(USER_ROLES.ADMIN),
  UserController.getAllRejectedHostRequest,
);

router.get('/all-host', auth(USER_ROLES.ADMIN), UserController.getAllHost);

router.patch(
  '/host-request-approve/:id',
  auth(USER_ROLES.ADMIN),
  UserController.approveHostRequest,
);

router.patch(
  '/host-request-reject/:id',
  auth(USER_ROLES.ADMIN),
  UserController.rejectHostRequest,
);

router.delete(
  '/delete-account',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.HOST),
  UserController.deleteUser,
);

router.get(
  '/connect-stripe',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.HOST),
  UserController.connectStripeAccount,
);

export const UserRoutes = router;

/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { messageController } from './message.controller';

const router = express.Router();

router.get(
  '/:groupId',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  messageController.showAllMessageSpeceficGroup,
);

export const messageRoutes = router;

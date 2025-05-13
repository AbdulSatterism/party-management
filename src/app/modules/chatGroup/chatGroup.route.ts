import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { chatGroupController } from './chatGroup.controller';

const router = express.Router();

router.get(
  '/my-chat-groups',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.HOST),
  chatGroupController.chattingGroupbySpecificUser,
);

router.post(
  '/add-guest/:groupId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.HOST),
  chatGroupController.addNewMember,
);

router.get(
  '/user-list/:groupId',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN, USER_ROLES.HOST),
  chatGroupController.getUserList,
);

export const ChatGroupRoutes = router;

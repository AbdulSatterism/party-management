import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { LeaveRecordController } from './leaveRecord.controller';

const router = express.Router();

router.get(
  '/',
  auth(USER_ROLES.ADMIN),
  LeaveRecordController.getAllLeaveRecordByAdmin,
);

export const LeaveRecordRoute = router;

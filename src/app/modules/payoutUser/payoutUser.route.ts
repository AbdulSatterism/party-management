import express from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import { PayoutUserController } from './payoutUser.controller';

const router = express.Router();

router.get(
  '/all-user-refunds',
  auth(USER_ROLES.ADMIN),
  PayoutUserController.allUserPayouts,
);

router.get(
  '/single-user-refund/:id',
  auth(USER_ROLES.ADMIN),
  PayoutUserController.singlePayout,
);

export const refundUserRoutes = router;

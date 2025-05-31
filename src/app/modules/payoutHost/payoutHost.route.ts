import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { HostPayoutController } from './payoutHost.controller';

const router = express.Router();

router.get(
  '/all-host-payouts',
  auth(USER_ROLES.ADMIN),
  HostPayoutController.allHostPayout,
);

router.get(
  '/single-host-payout/:id',
  auth(USER_ROLES.ADMIN),
  HostPayoutController.singlePayout,
);

export const hostPayoutRoutes = router;

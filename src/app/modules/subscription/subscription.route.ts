import { Router } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { SubscriptionController } from './subscription.controller';

const router = Router();

router.post(
  '/check-out',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  SubscriptionController.createCheckoutSessionController,
);

//* by admin only
router.get(
  '/get-all-subscription',
  auth(USER_ROLES.ADMIN),
  SubscriptionController.getAllSubs,
);

//* by admin only
router.get(
  '/get-subscription-details/:id',
  auth(USER_ROLES.ADMIN),
  SubscriptionController.getSingleSubscriptionDetails,
);

router.get(
  '/get-user-subscripton',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  SubscriptionController.getSpecificUserSubscription,
);

router.patch(
  '/update',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  SubscriptionController.updateSubs,
);

router.delete(
  '/cancel',
  auth(USER_ROLES.USER, USER_ROLES.ADMIN),
  SubscriptionController.cancelSubscriptation,
);

export const SubscriptionRoutes = router;

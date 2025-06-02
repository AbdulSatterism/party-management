import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { PaymentController } from './payment.controller';

const router = express.Router();

router.post(
  '/create-payment',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  PaymentController.createPayment,
);

router.get(
  '/all-payment',
  auth(USER_ROLES.ADMIN),
  PaymentController.allPayment,
);

router.get(
  '/single-payment/:id',
  auth(USER_ROLES.ADMIN),
  PaymentController.singlePayment,
);

export const PaymentRoutes = router;

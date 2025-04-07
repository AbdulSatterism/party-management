/* eslint-disable @typescript-eslint/no-explicit-any */
import express from 'express';
import { packageController } from './package.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { packageValidations } from './package.validation';

const router = express.Router();

router.post('/create', auth(USER_ROLES.ADMIN), packageController.createPackage);

router.get('/all-package', packageController.allPackage);

router.get(
  '/package-details/:id',
  auth(USER_ROLES.ADMIN),
  packageController.singlePackage,
);

router.patch(
  '/update/:id',
  auth(USER_ROLES.ADMIN),
  validateRequest(packageValidations.updatePackage),
  packageController.updatePackage,
);

router.delete(
  '/delete/:id',
  auth(USER_ROLES.ADMIN),
  packageController.deletePackage,
);

export const packageRoute = router;

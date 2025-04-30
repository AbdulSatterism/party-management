import express from 'express';
import auth from '../../middlewares/auth';
import { SavedPartyController } from './savedParty.controller';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
  '/create/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  SavedPartyController.savedParty,
);

router.get(
  '/my-saved-parties',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  SavedPartyController.getMySavedParties,
);

router.delete(
  '/remove-saved-party/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  SavedPartyController.removeSavedParty,
);

export const SavedPartyRoutes = router;

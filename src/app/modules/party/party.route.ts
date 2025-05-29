import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploadHandler';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { PartyValidation } from './party.validation';
import { PartyController } from './party.controller';

const route = express.Router();

route.post(
  '/create-party',
  fileUploadHandler(),
  auth(USER_ROLES.HOST),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(PartyValidation.createPartyValidationSchema),
  PartyController.createParty,
);

route.patch(
  '/update-party/:id',
  fileUploadHandler(),
  auth(USER_ROLES.HOST),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(PartyValidation.updatePartyValidationSchema),
  PartyController.updateParty,
);

route.get('/get-nearby-parties', PartyController.getNearbyParties);

// all parties by specific host
route.get(
  '/host-parties',
  auth(USER_ROLES.HOST, USER_ROLES.ADMIN),
  PartyController.getAllPartiesByHost,
);

route.get('/party-details/:id', PartyController.getSingleParty);

//! join and leave from party

route.post(
  '/join-party',
  auth(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN),
  PartyController.joinParty,
);

route.post(
  '/leave-party/:id',
  auth(USER_ROLES.USER, USER_ROLES.HOST, USER_ROLES.ADMIN),
  PartyController.leaveParty,
);

export const partyRoute = route;

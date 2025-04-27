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

export const partyRoute = route;

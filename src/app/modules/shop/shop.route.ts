import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ShopController } from './shop.controllers';
import validateRequest from '../../middlewares/validateRequest';
import { shopValidations } from './shop.validations';
import fileUploadHandler from '../../middlewares/fileUploadHandler';

const router = express.Router();

router.post(
  '/create-product',
  fileUploadHandler(),
  auth(USER_ROLES.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(shopValidations.createShopItemSchema),
  ShopController.createShop,
);

router.get('/all-products', ShopController.getAllShopItems);

router.get('/product-details/:id', ShopController.getShopItemById);

export const ShopRoutes = router;

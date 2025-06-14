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

router.get(
  '/all-products',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  ShopController.getAllShopItems,
);

router.get(
  '/product-details/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  ShopController.getShopItemById,
);

router.delete(
  '/delete-product/:id',
  auth(USER_ROLES.ADMIN),
  ShopController.deleteShopItem,
);

router.patch(
  '/update-product/:id',
  fileUploadHandler(),
  auth(USER_ROLES.ADMIN),
  (req: Request, res: Response, next: NextFunction) => {
    req.body = JSON.parse(req.body.data);
    next();
  },
  validateRequest(shopValidations.updateShopItemSchema),
  ShopController.updateShopItem,
);

export const ShopRoutes = router;

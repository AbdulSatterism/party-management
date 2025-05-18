import express from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import validateRequest from '../../middlewares/validateRequest';
import { ShopCategoryValidation } from './shopCategory.validation';
import { shopCategoryControllers } from './shopCategory.controllers';

const router = express.Router();

router.post(
  '/create-shop-category',
  auth(USER_ROLES.ADMIN),
  validateRequest(ShopCategoryValidation.createShopCategorySchema),
  shopCategoryControllers.createShopCategory,
);

router.get(
  '/all-shop-category',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  shopCategoryControllers.getAllShopCategory,
);

router.get(
  '/single-shop-category/:id',
  auth(USER_ROLES.ADMIN, USER_ROLES.USER, USER_ROLES.HOST),
  shopCategoryControllers.getShopCategoryById,
);

export const shopCategoryRoutes = router;

import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IShopItem } from './shop.interface';
import { Shop } from './shop.model';

const createShopItem = async (userId: string, payload: IShopItem) => {
  const isUserExist = await User.isExistUserById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  if (isUserExist.role !== 'ADMIN') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to create Shop!',
    );
  }

  const shopItem = await Shop.create(payload);

  return shopItem;
};

export const ShopService = {
  createShopItem,
};

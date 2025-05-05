import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IShopItem } from './shop.interface';
import { Shop } from './shop.model';
import { ShopCategory } from '../shopCategory/shopCategory.model';

const createShopItem = async (userId: string, payload: IShopItem) => {
  const isUserExist = await User.findById(userId);

  if (!isUserExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'User not found!');
  }

  if (isUserExist.role !== 'ADMIN') {
    throw new AppError(
      StatusCodes.FORBIDDEN,
      'You are not authorized to create Shop!',
    );
  }

  const isCategoryExist = await ShopCategory.findById(payload?.category);
  if (!isCategoryExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Shop category not found!');
  }

  const shopItem = await Shop.create(payload);

  return shopItem;
};

const getAllShopItems = async () => {
  const shopItems = await Shop.find({}).populate(
    'category',
    'categoryName _id',
  );

  return shopItems;
};

const getShopItemById = async (id: string) => {
  const shopItem = await Shop.findById(id).populate(
    'category',
    'categoryName _id',
  );

  if (!shopItem) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Shop item not found!');
  }

  return shopItem;
};

export const ShopService = {
  createShopItem,
  getAllShopItems,
  getShopItemById,
};

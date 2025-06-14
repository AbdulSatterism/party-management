import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { User } from '../user/user.model';
import { IShopItem } from './shop.interface';
import { Shop } from './shop.model';
import { ShopCategory } from '../shopCategory/shopCategory.model';
import unlinkFile from '../../../shared/unlinkFile';

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

const getAllShopItems = async (search?: string) => {
  // If no search term, return all items
  if (!search) {
    return Shop.find({}).populate('category', 'categoryName _id').lean();
  }

  const regex = new RegExp(search.split(' ').join('|'), 'i');

  return Shop.find({ title: { $regex: regex } })
    .populate('category', 'categoryName _id')
    .lean();
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

const deleteShopItem = async (id: string) => {
  const shopItem = await Shop.findByIdAndDelete(id);

  if (!shopItem) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Shop item not found!');
  }

  return shopItem;
};

const updateShopItem = async (shopId: string, payload: Partial<IShopItem>) => {
  const shopItem = await Shop.findById(shopId);

  if (!shopItem) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Shop item not found!');
  }

  if (payload.image && shopItem.image) {
    unlinkFile(shopItem.image);
  }

  const updatedShopItem = await Shop.findByIdAndUpdate(shopId, payload, {
    new: true,
  });

  if (!updatedShopItem) {
    throw new AppError(StatusCodes.NOT_FOUND, 'Shop item not found!');
  }

  return updatedShopItem;
};

export const ShopService = {
  createShopItem,
  getAllShopItems,
  getShopItemById,
  deleteShopItem,
  updateShopItem,
};

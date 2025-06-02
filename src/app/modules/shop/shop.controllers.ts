import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { ShopService } from './shop.services';

const createShop = catchAsync(async (req, res) => {
  const userId = req.user.id;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await ShopService.createShopItem(userId, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'product created successfully',
    data: result,
  });
});

const getAllShopItems = catchAsync(async (req, res) => {
  const result = await ShopService.getAllShopItems(
    req?.query?.search as string,
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Shop retrieved successfully',
    data: result,
  });
});

const getShopItemById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await ShopService.getShopItemById(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Shop retrieved successfully',
    data: result,
  });
});

export const ShopController = {
  createShop,
  getAllShopItems,
  getShopItemById,
};

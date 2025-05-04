import { StatusCodes } from 'http-status-codes';
import sendResponse from '../../../shared/sendResponse';
import catchAsync from '../../../shared/catchAsync';
import { shopCategoryServices } from './shopCategory.services';

const createShopCategory = catchAsync(async (req, res) => {
  const result = await shopCategoryServices.createCategory(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'category created succefully',
    data: result,
  });
});

const getAllShopCategory = catchAsync(async (req, res) => {
  const result = await shopCategoryServices.getAllCategory();

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'category retrieve succefully',
    data: result,
  });
});

const getShopCategoryById = catchAsync(async (req, res) => {
  const { id } = req.params;
  const result = await shopCategoryServices.getCategoryById(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'category retrieve succefully',
    data: result,
  });
});

export const shopCategoryControllers = {
  createShopCategory,
  getAllShopCategory,
  getShopCategoryById,
};

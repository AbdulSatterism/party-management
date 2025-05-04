import { IShopCategory } from './shopCategory.interface';
import { ShopCategory } from './shopCategory.model';

const createCategory = async (payload: IShopCategory) => {
  const result = await ShopCategory.create(payload);

  return result;
};

const getAllCategory = async () => {
  const result = await ShopCategory.find();

  return result;
};

const getCategoryById = async (id: string) => {
  const result = await ShopCategory.findById(id);

  return result;
};

export const shopCategoryServices = {
  createCategory,
  getAllCategory,
  getCategoryById,
};

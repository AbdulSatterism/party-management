import { Schema, model, Document } from 'mongoose';
import { IShopCategory } from './shopCategory.interface';

interface IShopCategoryDoc extends IShopCategory, Document {}

const shopCategorySchema = new Schema<IShopCategoryDoc>(
  {
    categoryName: { type: String, required: true, unique: true },
  },
  { timestamps: true },
);

export const ShopCategory = model<IShopCategoryDoc>(
  'ShopCategory',
  shopCategorySchema,
);

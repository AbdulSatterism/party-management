import { Schema, model, Document } from 'mongoose';
import { IShopItem } from './shop.interface';

interface IShopItemDoc extends IShopItem, Document {}

const shopSchema = new Schema<IShopItemDoc>(
  {
    category: {
      type: Schema.Types.ObjectId,
      ref: 'ShopCategory',
      required: true,
    },
    title: { type: String, required: true },
    price: { type: Number, required: true },
    link: { type: String, required: true },
    image: { type: String, required: true },
    rating: { type: Number, required: true },
  },
  { timestamps: true },
);

export const Shop = model<IShopItemDoc>('Shop', shopSchema);

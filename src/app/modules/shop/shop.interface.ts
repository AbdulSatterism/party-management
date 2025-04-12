import { Types } from 'mongoose';

export interface IShopItem {
  category: Types.ObjectId; // Reference to ShopCategory model
  title: string;
  price: number;
  link: string;
  image: string;
  rating: number;
}

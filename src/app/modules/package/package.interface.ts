/* eslint-disable @typescript-eslint/no-explicit-any */
export type IPackage = {
  name: string | any;
  description: string[];
  unitAmount: number;
  interval: 'day' | 'week' | 'month' | 'year' | 'half-year';
  productId: string;
  priceId: string;
  price: number;
};

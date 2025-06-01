import { IUserPayout } from './payoutUser.interface';
import { UserPayout } from './payoutUser.model';

const createUserPayout = async (data: IUserPayout) => {
  return await UserPayout.create(data);
};

const getAllUserPayouts = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const currentPage = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 10;
  const skip = (currentPage - 1) * pageSize;

  const totalData = await UserPayout.countDocuments();
  const totalPages = Math.ceil(totalData / pageSize);

  const totalAmountResult = await UserPayout.aggregate([
    { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
  ]);
  const totalAmount =
    totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

  const data = await UserPayout.find()
    .populate('userId', 'name email')
    .populate('partyId', 'partyName partyDate')
    .skip(skip)
    .limit(pageSize)
    .lean();

  return {
    data,
    meta: {
      totalData,
      totalPages,
      currentPage,
      pageSize,
      totalAmount,
    },
  };
};

const getUserPayoutById = async (id: string) => {
  return await UserPayout.findById(id)
    .populate('userId', 'name email')
    .populate('partyId', 'partyName partyDate');
};

export const PayoutUserService = {
  getAllUserPayouts,
  getUserPayoutById,
  createUserPayout,
};

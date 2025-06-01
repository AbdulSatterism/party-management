import { IHostPayout } from './payoutHost.interface';
import { HostPayout } from './payoutHost.model';

const createHostPayout = async (data: IHostPayout) => {
  return await HostPayout.create(data);
};

const getAllPayouts = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const currentPage = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 10;
  const skip = (currentPage - 1) * pageSize;

  const totalData = await HostPayout.countDocuments();
  const totalPages = Math.ceil(totalData / pageSize);

  const totalAmountResult = await HostPayout.aggregate([
    { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
  ]);
  const totalAmount =
    totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

  const data = await HostPayout.find()
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

const getSinglePayout = async (id: string) => {
  return await HostPayout.findById(id)
    .populate('userId', 'name email')
    .populate('partyId', 'partyName partyDate');
};

export const HostPayoutService = {
  createHostPayout,
  getAllPayouts,
  getSinglePayout,
};

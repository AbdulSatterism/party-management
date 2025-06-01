import { StatusCodes } from 'http-status-codes';
import AppError from '../../errors/AppError';
import { Payment } from './payment.model';

const allPayments = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const currentPage = parseInt(page as string) || 1;
  const pageSize = parseInt(limit as string) || 10;
  const skip = (currentPage - 1) * pageSize;

  const totalData = await Payment.countDocuments();
  const totalPages = Math.ceil(totalData / pageSize);

  const totalAmountResult = await Payment.aggregate([
    { $group: { _id: null, totalAmount: { $sum: '$amount' } } },
  ]);
  const totalAmount =
    totalAmountResult.length > 0 ? totalAmountResult[0].totalAmount : 0;

  const data = await Payment.find({})
    .populate('userId', 'name email paypalAccount')
    .populate('partyId', 'name paypalAccount')
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

const singlePayment = async (id: string) => {
  const isExist = await Payment.findById(id)
    .populate('userId', 'name email paypalAccount')
    .populate('partyId', 'partyName  paypalAccount')
    .lean();

  if (!isExist) {
    throw new AppError(StatusCodes.NOT_FOUND, 'this payment does not exist');
  }

  return isExist;
};

export const PaymentService = {
  allPayments,
  singlePayment,
};

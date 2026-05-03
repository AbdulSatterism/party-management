/* eslint-disable @typescript-eslint/no-explicit-any */
import { LeaveRecord } from './leaveRecord.model';

const getAllLeaveRecordByAdmin = async (query: Record<string, unknown>) => {
  const { page, limit } = query;
  const pages = parseInt(page as string) || 1;
  const size = parseInt(limit as string) || 10;
  const skip = (pages - 1) * size;

  const result = await LeaveRecord.find()
    .populate({
      path: 'paymentId',
      select: '-amount -status -_id -createdAt -updatedAt',
      populate: [
        {
          path: 'userId',
          select: 'name email stripeAccount paypalAccount -_id',
        },
        {
          path: 'partyId',
          select: 'partyname -_id',
          populate: [
            {
              path: 'userId',
              select: 'name email -_id',
            },
          ],
        },
      ],
    })
    .sort({ refundStatus: -1, createdAt: -1 })
    .skip(skip)
    .limit(size)
    .lean();

  const formattedResult = result.map((item: any) => {
    if (item?.paymentId?.partyId?.userId) {
      item.paymentId.partyId.host = item.paymentId.partyId.userId;
      delete item.paymentId.partyId.userId;
    }

    return item;
  });

  const count = await LeaveRecord.countDocuments();

  return {
    result: formattedResult,
    totalData: count,
    page: pages,
    limit: size,
  };
};

// get single record

const getSingleLeaveRecord = async (id: string) => {
  const result = await LeaveRecord.findById(id).populate({
    path: 'paymentId',
    select: '-amount -status -_id -createdAt -updatedAt',
    populate: [
      {
        path: 'userId',
        select: 'name email stripeAccount paypalAccount -_id',
      },
      {
        path: 'partyId',
        select: 'partyname -_id',
        populate: [
          {
            path: 'userId',
            select: 'name email -_id',
          },
        ],
      },
    ],
  });

  return result;
};

// update refund status by admin
const updateRefundStatus = async (id: string) => {
  const result = await LeaveRecord.findByIdAndUpdate(
    id,
    { refundStatus: 'PAID' },
    { new: true },
  );

  return result;
};

export const LeaveRecordService = {
  getAllLeaveRecordByAdmin,
  getSingleLeaveRecord,
  updateRefundStatus,
};

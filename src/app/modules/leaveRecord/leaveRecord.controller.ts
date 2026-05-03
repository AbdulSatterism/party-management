import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { LeaveRecordService } from './leaveRecord.services';

const getAllLeaveRecordByAdmin = catchAsync(async (req, res) => {
  const result = await LeaveRecordService.getAllLeaveRecordByAdmin(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Notification retrived successfully',
    data: result,
  });
});

const getSingleLeaveRecord = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await LeaveRecordService.getSingleLeaveRecord(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Leave record retrived successfully',
    data: result,
  });
});

const updateRefundStatus = catchAsync(async (req, res) => {
  const id = req.params.id;
  const result = await LeaveRecordService.updateRefundStatus(id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Refund status updated successfully',
    data: result,
  });
});

export const LeaveRecordController = {
  getAllLeaveRecordByAdmin,
  getSingleLeaveRecord,
  updateRefundStatus,
};

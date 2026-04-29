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

export const LeaveRecordController = {
  getAllLeaveRecordByAdmin,
};

import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { HostPayoutService } from './payoutHost.service';

const allHostPayout = catchAsync(async (req, res) => {
  const result = await HostPayoutService.getAllPayouts(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all host payment returns successfully',
    data: result,
  });
});

const singlePayout = catchAsync(async (req, res) => {
  const result = await HostPayoutService.getSinglePayout(req?.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'user payment returns successfully',
    data: result,
  });
});

export const HostPayoutController = {
  allHostPayout,
  singlePayout,
};

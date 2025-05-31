import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PayoutUserService } from './payoutUser.service';

const allUserPayouts = catchAsync(async (req, res) => {
  const result = await PayoutUserService.getAllUserPayouts(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all user payment returns successfully',
    data: result,
  });
});

const singlePayout = catchAsync(async (req, res) => {
  const result = await PayoutUserService.getUserPayoutById(req?.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'user payment returns successfully',
    data: result,
  });
});

export const PayoutUserController = {
  allUserPayouts,
  singlePayout,
};

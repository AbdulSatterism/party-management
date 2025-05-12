import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { chatGroupService } from './chatGroup.service';

const chattingGroupbySpecificUser = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const search = req.query.search ? String(req.query.search) : '';

  const result = await chatGroupService.chattingGroupbySpecificUser(userId, {
    search,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'user chatting group retrieved successfully',
    data: result,
  });
});

export const chatGroupController = {
  chattingGroupbySpecificUser,
};

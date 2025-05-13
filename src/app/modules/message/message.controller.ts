import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { messageService } from './message.service';

const showAllMessageSpeceficGroup = catchAsync(async (req, res) => {
  const result = await messageService.showAllMessageSpeceficGroup(
    req.params.groupId,
    req.query as unknown as { limit: number; page: number },
  );

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all message',
    data: result,
  });
});

export const messageController = {
  showAllMessageSpeceficGroup,
};

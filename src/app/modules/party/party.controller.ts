import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PartyService } from './party.services';

const createParty = catchAsync(async (req, res) => {
  const userId = req.user.id;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await PartyService.createParyty(userId, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Party created successfully',
    data: result,
  });
});

export const PartyController = {
  createParty,
};

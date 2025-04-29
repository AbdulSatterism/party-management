import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { SavedPartyService } from './savedParty.services';

const savedParty = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const partyId = req.params.id;
  const result = await SavedPartyService.savedParty(userId, partyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Party saved successfully',
    data: result,
  });
});

const getMySavedParties = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await SavedPartyService.getMySavedParties(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'My saved parties',
    data: result,
  });
});

const removeSavedParty = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const partyId = req.params.id;
  const result = await SavedPartyService.removeSavedParty(userId, partyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Party removed from saved parties',
    data: result,
  });
});

export const SavedPartyController = {
  savedParty,
  getMySavedParties,
  removeSavedParty,
};

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
    ...JSON.parse(req.body),
  };

  const result = await PartyService.createParyty(userId, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Party created successfully',
    data: result,
  });
});

const getNearbyParties = catchAsync(async (req, res) => {
  const lat = Number(req.query.lat);
  const lon = Number(req.query.lon);
  const days = req.query.days ? Number(req.query.days) : undefined;
  const search = req.query.search ? String(req.query.search) : undefined;
  const country = req.query.country ? String(req.query.country) : undefined;

  const userId = req.user.id;

  const parties = await PartyService.getNearbyParties({
    lat,
    lon,
    days,
    search,
    country,
    userId,
  });

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Nearest all parties',
    data: parties,
  });
});

const getSingleParty = catchAsync(async (req, res) => {
  const partyId = req.params.id;
  const result = await PartyService.getSingleParty(partyId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'Party retrieved successfully',
    data: result,
  });
});

//* all parties by specific host
const getAllPartiesByHost = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const parties = await PartyService.getAllPartiesByHost(userId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All parties by host',
    data: parties,
  });
});

const updateParty = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const partyId = req.params.id;

  let image;
  if (req.files && 'image' in req.files && req.files.image[0]) {
    image = `/images/${req.files.image[0].filename}`;
  }

  const value = {
    image,
    ...req.body,
  };

  const result = await PartyService.updateParty(userId, partyId, value);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'party updated successfully',
    data: result,
  });
});

const joinParty = catchAsync(async (req, res) => {
  const userId = req.user.id;

  await PartyService.joinParty(userId, req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'joined successfully',
    data: 'joined successfully',
  });
});

const leaveParty = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const partyId = req.params.id;
  const result = await PartyService.leaveParty(userId, partyId);
  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'left successfully',
    data: result,
  });
});

const upcommingParties = catchAsync(async (req, res) => {
  const result = await PartyService.upcomingParties(req?.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'upcomming parties',
    data: result,
  });
});

const pastParties = catchAsync(async (req, res) => {
  const result = await PartyService.pastParties(req?.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'past parties',
    data: result,
  });
});

const paidParties = catchAsync(async (req, res) => {
  const result = await PartyService.paidParties(req?.user?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'paid parties',
    data: result,
  });
});

const saveStatus = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const partyId = req.params.id;

  const isSaved = await PartyService.saveStatus(userId, partyId);

  res.status(StatusCodes.OK).send(isSaved); // 👈 just true or false
});

const allParties = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const result = await PartyService.getAllParties(userId, req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'All parties retrieved successfully',
    data: result,
  });
});

export const PartyController = {
  createParty,
  updateParty,
  getNearbyParties,
  getSingleParty,
  getAllPartiesByHost,
  joinParty,
  leaveParty,
  upcommingParties,
  pastParties,
  paidParties,
  saveStatus,
  allParties,
};

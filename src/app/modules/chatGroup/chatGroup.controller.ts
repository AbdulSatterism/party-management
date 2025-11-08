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

const addNewMember = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const groupId = req.params.groupId;
  const guestId = req.body.guestId;

  const result = await chatGroupService.addNewMember(userId, groupId, guestId);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'guest added successfully',
    data: result,
  });
});

const getUserList = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const groupId = req.params.groupId;
  const search = req.query.search ? String(req.query.search) : '';
  const result = await chatGroupService.getUserList(userId, groupId, search);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'user list retrieved successfully',
    data: result,
  });
});

const createReport = catchAsync(async (req, res) => {
  const result = await chatGroupService.createReport(req.body);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.CREATED,
    message: 'Report created successfully',
    data: result,
  });
});

export const chatGroupController = {
  chattingGroupbySpecificUser,
  addNewMember,
  getUserList,
  createReport,
};

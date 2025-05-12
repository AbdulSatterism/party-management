import { ChatGroup } from './chatGroup.model';

const chattingGroupbySpecificUser = async (
  userId: string,
  query: { search: string },
) => {
  const { search } = query;

  const baseQuery: {
    $or: { [key: string]: string }[];
    groupName?: { $regex: string; $options: string };
  } = {
    $or: [{ 'members.userId': userId }, { 'members.guest': userId }],
  };

  // If the search term is provided, add it to the query to filter by groupName
  if (search) {
    baseQuery['groupName'] = { $regex: search, $options: 'i' }; // Case-insensitive regex search
  }

  const groups = await ChatGroup.find(baseQuery);
  return groups;
};

// {
//   "success": true,
//   "message": "user chatting group retrieved successfully",
//   "data": [
//       {
//           "_id": "6822135b54a2d9d92af81310",
//           "partyId": "680e482d4840ef44287c0187",
//           "groupName": "Danger zone",
//           "members": [
//               {
//                   "userId": "6809179432c591c8e4cf0b0d",
//                   "ticket": 3,
//                   "limit": 3,
//                   "guest": [],
//                   "_id": "6822160e3d1d3daf16cb55c6"
//               }
//           ],
//           "createdAt": "2025-05-12T15:27:23.053Z",
//           "updatedAt": "2025-05-12T15:38:54.206Z",
//           "__v": 0
//       }
//   ]
// }
//* add new member in the group
//* member only can add like have userId and guest if userId matched this userId then this user can add but if limit 0 or 1 then can't add others, if limit have 2 then can add 1 , when add a user this user added in the guest and decrease the limit : if limit 0 or 1 can't added

const addNewMember = async (
  userId: string,
  groupId: string,
  guestId: string,
) => {
  const group = await ChatGroup.find({
    _id: groupId,
    'members.userId': userId,
    'members.limit': { $gt: 0 },
  });
  if (!group) {
    throw new Error('Group not found or user not authorized to add members');
  }
  const updatedGroup = await ChatGroup.findOneAndUpdate(
    { _id: groupId, 'members.userId': userId },
    {
      $push: { 'members.$.guest': guestId },
      $inc: { 'members.$.limit': -1 },
    },
    { new: true },
  );
  return updatedGroup;
};

export const chatGroupService = {
  chattingGroupbySpecificUser,
};

import dayjs from 'dayjs';
import { Party } from '../app/modules/party/party.model';
import { ChatGroup } from '../app/modules/chatGroup/chatGroup.model';
import cron from 'node-cron';
import { logger } from '../shared/logger';
import colors from 'colors';

export const groupActivation = async () => {
  try {
    // Fetch all parties
    const parties = await Party.find({});

    for (const party of parties) {
      const chatGroup = await ChatGroup.findOne({ partyId: party._id });
      if (!chatGroup) continue;

      // Dates
      const today = dayjs();
      const activateDate = dayjs(party.partyDate).subtract(7, 'day');
      const deactivateDate = dayjs(party.partyDate).add(7, 'day');

      // Activate chat group
      if (today.isAfter(activateDate) && today.isBefore(deactivateDate)) {
        if (!chatGroup.isActive) {
          chatGroup.isActive = true;
          await chatGroup.save();
        }
      }

      // Deactivate chat group
      else {
        if (chatGroup.isActive) {
          chatGroup.isActive = false;
          await chatGroup.save();
        }
      }
    }
  } catch (err) {
    logger.error(colors.red(`Error in group activation cron job: ${err}`));
  }
};

// Run every 12 hours (twice daily at 12:00 AM and 12:00 PM)
cron.schedule('0 0,12 * * *', async () => {
  await groupActivation();
});

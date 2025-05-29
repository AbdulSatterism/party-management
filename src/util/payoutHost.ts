import cron from 'node-cron';
import { errorLogger, logger } from '../shared/logger';
import { Party } from '../app/modules/party/party.model';
import { payoutToHost } from '../app/modules/payment/utils';

const schedulePayoutCron = () => {
  // Runs every day at 18:48 server time
  cron.schedule('32 22 * * *', async () => {
    try {
      logger.info('Cron job started: Checking parties for payout');

      const today = new Date();
      const futureDate = new Date();

      const normalizeDateToISO = (date: Date) =>
        date.toISOString().split('T')[0];

      const startDateStr = normalizeDateToISO(today);
      futureDate.setDate(today.getDate() + 3);
      const endDateStr = normalizeDateToISO(futureDate);

      const partiesToPayout = await Party.find({
        partyDate: { $gte: startDateStr, $lte: endDateStr },
        income: { $gt: 0 },
        paypalAccount: { $exists: true, $ne: null },
      }).select(
        '_id partyName partyDate partyFee address income paypalAccount',
      );

      if (partiesToPayout.length === 0) {
        logger.info('No parties found for payout today.');
        return;
      }

      for (const party of partiesToPayout) {
        try {
          const payoutAmount = party.income;

          logger.info(
            `Payout started for party ${party._id} (${party.partyName}) amount: $${payoutAmount}`,
          );

          // Perform payout to host PayPal account
          await payoutToHost(
            party.paypalAccount,
            payoutAmount,
            party.partyName,
            party._id?.toString() || '',
          );

          // Reset income after successful payout
          party.income = 0;
          await party.save();

          logger.info(
            `Payout completed for party ${party._id} (${party.partyName})`,
          );
        } catch (payoutError) {
          errorLogger.error(
            `Error during payout for party ${party._id}:`,
            payoutError,
          );
        }
      }
    } catch (err) {
      errorLogger.error('Error running payout cron job:', err);
    }
  });
};

export default schedulePayoutCron;

// Cron job to run daily at 2:00 AM server time (adjust as needed)
// export const schedulePayoutCron = () => {
//   cron.schedule('48 18 * * *', async () => {
//     try {
//       logger.info('Cron job started: Checking parties for payout');

//       const today = new Date();
//       const threeDaysFromNow = new Date();
//       threeDaysFromNow.setDate(today.getDate() + 3);

//       // Find parties where partyDate is between now and 3 days later (inclusive)
//       const partiesToPayout = await Party.find({
//         partyDate: {
//           $gte: today,
//           $lte: threeDaysFromNow,
//         },
//         income: { $gt: 0 },
//         paypalAccount: { $exists: true, $ne: null },
//       });

//       if (!partiesToPayout.length) {
//         logger.info('No parties found for payout today.');
//         return;
//       }

//       for (const party of partiesToPayout) {
//         try {
//           const payoutAmount = party.income;

//           logger.info(
//             `Payout started for party ${party._id} (${party.partyName}) amount: $${payoutAmount}`,
//           );

//           // Call payoutToHost with party host PayPal email and amount
//           await payoutToHost(
//             party.paypalAccount,
//             payoutAmount,
//             party.partyName,
//             party._id?.toString() ?? '',
//           );

//           // Reset income after successful payout
//           party.income = 0;
//           await party.save();

//           logger.info(
//             `Payout completed for party ${party._id} (${party.partyName})`,
//           );
//         } catch (payoutError) {
//           errorLogger.error(
//             `Error during payout for party ${party._id}:`,
//             payoutError,
//           );
//         }
//       }
//     } catch (err) {
//       errorLogger.error('Error running payout cron job:', err);
//     }
//   });
// };

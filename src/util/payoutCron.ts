import cron from 'node-cron';
import { errorLogger, logger } from '../shared/logger';
import { Party } from '../app/modules/party/party.model';
import { payoutToHost } from '../app/modules/payment/utils';
import { HostPayoutService } from '../app/modules/payoutHost/payoutHost.service';
import mongoose from 'mongoose';
import { IPayoutConfirmation } from '../types/emailTamplate';
import { User } from '../app/modules/user/user.model';
import { emailTemplate } from '../shared/emailTemplate';
import { emailHelper } from '../helpers/emailHelper';

const schedulePayoutCron = () => {
  // Runs every day at 10  server time

  cron.schedule('0 10 * * *', async () => {
    try {
      logger.info('Cron job started: Checking parties for payout');

      const today = new Date();
      const futureDate = new Date();

      const startDateStr = today.toISOString();
      futureDate.setDate(today.getDate() + 2);
      const endDateStr = futureDate.toISOString();

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
          const payoutResponse = await payoutToHost(
            party.paypalAccount,
            payoutAmount,
            party.partyName,
            party._id?.toString() || '',
          );

          const paypalBatchId = payoutResponse.batch_header?.payout_batch_id;

          // Save payout record for this host payout
          await HostPayoutService.createHostPayout({
            userId: party.userId,
            partyId: new mongoose.Types.ObjectId(party._id?.toString()) || '',
            email: party.paypalAccount,
            amount: payoutAmount,
            status: 'COMPLETED',
            paypalBatchId,
            note: `Payout for party host: ${party.partyName}`,
          });

          // Reset income after successful payout
          party.income = 0;
          await party.save();

          logger.info(
            `Payout completed for party ${party._id} (${party.partyName})`,
          );

          const user = await User.findById(party.userId);
          // send confirmation email to host
          const emailValues: IPayoutConfirmation = {
            email: user?.email || party.paypalAccount,
            partyName: party.partyName,
            amount: payoutAmount,
            status: 'COMPLETED',
            paypalBatchId: paypalBatchId || '',
          };

          // Send email to host
          const hostConfermationMail =
            emailTemplate.poyoutHostConfirmation(emailValues);
          emailHelper.sendEmail(hostConfermationMail);
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

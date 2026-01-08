import cron from 'node-cron';
import { errorLogger, logger } from '../shared/logger';
import { Party } from '../app/modules/party/party.model';
import { payoutToHost, stripeHostPayout } from '../app/modules/payment/utils';
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

          // Fetch party host
          const partyHost = await User.findById(party.userId);
          if (!partyHost) {
            throw new Error(`Party host not found for party ${party._id}`);
          }

          const partyIdStr = party._id?.toString() || '';
          let paypalBatchId = '';

          // Process payout based on selected payment method
          if (party.payoutOption === 'PAYPAL') {
            const payoutResponse = await payoutToHost(
              party.paypalAccount,
              payoutAmount,
              party.partyName,
              partyIdStr,
            );

            paypalBatchId = payoutResponse.batch_header?.payout_batch_id;

            await HostPayoutService.createHostPayout({
              userId: party.userId,
              partyId: new mongoose.Types.ObjectId(partyIdStr),
              email: party.paypalAccount,
              amount: payoutAmount,
              status: 'COMPLETED',
              paypalBatchId,
              note: `Payout for party host: ${party.partyName}`,
            });
          } else if (party.payoutOption === 'STRIPE') {
            await stripeHostPayout({
              amount: payoutAmount,
              stripeAccountId: partyHost.stripeAccountId!,
              description: `Refund for leaving party: ${party.partyName}`,
              userId: party.userId?.toString() || '',
              partyId: partyIdStr,
              receiverEmail: party.paypalAccount,
            });
          }

          // Reset income and save party
          party.income = 0;
          await party.save();

          logger.info(
            `Payout completed for party ${party._id} (${party.partyName})`,
          );

          // Send confirmation email to host
          const emailValues: IPayoutConfirmation = {
            email: partyHost.email || party.paypalAccount,
            partyName: party.partyName,
            amount: payoutAmount,
            status: 'COMPLETED',
            paypalBatchId: paypalBatchId || '',
          };

          const hostConfirmationMail =
            emailTemplate.poyoutHostConfirmation(emailValues);
          emailHelper.sendEmail(hostConfirmationMail);
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

import { StatusCodes } from 'http-status-codes';
import catchAsync from '../../../shared/catchAsync';
import sendResponse from '../../../shared/sendResponse';
import { PaymentService } from './payment.service';

// const createPaymentUrl = async (req: Request, res: Response) => {
//   try {
//     const { partyId, userId, amount } = req.body;

//     // Validate input
//     if (!partyId || !userId || !amount) {
//       return sendResponse(res, 400, 'Missing partyId, userId, or amount');
//     }

//     // Get PayPal payment link
//     const paymentUrl = await createPayPalOrder(partyId, userId, amount);

//     // Send response with the PayPal payment link
//     return sendResponse(res, 200, 'Payment link created successfully', {
//       paymentUrl,
//     });
//   } catch (error: any) {
//     return sendResponse(
//       res,
//       500,
//       error.message || 'Failed to create payment link',
//     );
//   }
// };

// const createPayment = catchAsync(async (req, res) => {
//   try {
//     const { partyId, userId, amount } = req.body;

//     // Validate input
//     if (!partyId || !userId || !amount) {
//       return sendResponse(res, 400, 'Missing partyId, userId, or amount');
//     }

//     // Get PayPal payment link
//     const paymentUrl = await createPaymentIntent(partyId, userId, amount);

//     // Send response with the PayPal payment link
//     return sendResponse(res, 200, 'Payment link created successfully', {
//       paymentUrl,
//     });

//   sendResponse(res, {
//     success: true,
//     statusCode: StatusCodes.OK,
//     message: 'all payment returns successfully',
//     data: result,
//   });
// });

const allPayment = catchAsync(async (req, res) => {
  const result = await PaymentService.allPayments(req.query);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'all payment returns successfully',
    data: result,
  });
});

const singlePayment = catchAsync(async (req, res) => {
  const result = await PaymentService.singlePayment(req?.params?.id);

  sendResponse(res, {
    success: true,
    statusCode: StatusCodes.OK,
    message: 'user payment returns successfully',
    data: result,
  });
});

export const PaymentController = {
  allPayment,
  singlePayment,
};

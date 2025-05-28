import config from '../../../config';
import axios from 'axios';
import { Buffer } from 'buffer';

const clientId = config.paypal.client_id!;
const clientSecret = config.paypal.client_secret!;

// Get PayPal access token
const getPayPalAccessToken = async (): Promise<string> => {
  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  const response = await axios.post(
    'https://api.sandbox.paypal.com/v1/oauth2/token', // Use live endpoint for production
    'grant_type=client_credentials',
    {
      headers: {
        Authorization: `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    },
  );
  return response.data.access_token;
};

// Capture PayPal order payment
export const captureOrder = async (orderId: string) => {
  const accessToken = await getPayPalAccessToken();
  const response = await axios.post(
    `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, // Use live endpoint for production
    {}, // empty body required
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );
  return response.data;
};

// Payout 90% amount to party host
export const payoutToHost = async (
  receiverEmail: string,
  amount: number,
  partyName: string,
  partyId: string,
) => {
  const accessToken = await getPayPalAccessToken();

  const payoutBody = {
    sender_batch_header: {
      sender_batch_id: `payout_${Date.now()}_${partyId}`,
      email_subject: 'You have a payout for your party',
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: amount.toFixed(2),
          currency: 'USD',
        },
        receiver: receiverEmail,
        note: `Payout for party host: ${partyName}`,
        sender_item_id: `item_${Date.now()}`,
      },
    ],
  };

  const response = await axios.post(
    'https://api.sandbox.paypal.com/v1/payments/payouts', // live endpoint for production
    payoutBody,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

// Refund user when leaving party >7 days before party date
export const payoutToUser = async (
  receiverEmail: string,
  amount: number,
  partyName: string,
  partyId: string,
) => {
  const accessToken = await getPayPalAccessToken();

  const payoutBody = {
    sender_batch_header: {
      sender_batch_id: `refund_${Date.now()}_${partyId}`,
      email_subject: 'Refund for leaving party',
    },
    items: [
      {
        recipient_type: 'EMAIL',
        amount: {
          value: amount.toFixed(2),
          currency: 'USD',
        },
        receiver: receiverEmail,
        note: `Refund for leaving party: ${partyName}`,
        sender_item_id: `item_${Date.now()}`,
      },
    ],
  };

  const response = await axios.post(
    'https://api.sandbox.paypal.com/v1/payments/payouts', // live endpoint for production
    payoutBody,
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    },
  );

  return response.data;
};

// import config from '../../../config';

// import axios from 'axios';
// import { Buffer } from 'buffer';

// const clientId = config.paypal.client_id!;
// const clientSecret = config.paypal.client_secret!;

// export const payoutToHost = async (
//   receiverEmail: string,
//   amount: number,
//   partyName: string,
//   partyId: string,
// ) => {
//   const accessToken = await getPayPalAccessToken(); // Get the access token

//   const payoutBody = {
//     sender_batch_header: {
//       sender_batch_id: `payout_${Date.now()}_${partyId}`,
//       email_subject: 'You have a payout for your party',
//     },
//     items: [
//       {
//         recipient_type: 'EMAIL',
//         amount: {
//           value: amount.toFixed(2),
//           currency: 'USD',
//         },
//         receiver: receiverEmail,
//         note: `Payout for party host: ${partyName}`,
//         sender_item_id: `item_${Date.now()}`,
//       },
//     ],
//   };

//   const response = await axios.post(
//     'https://api.sandbox.paypal.com/v1/payments/payouts',
//     payoutBody,
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     },
//   );
//   return response.data;
// };

// export const payoutToUser = async (
//   receiverEmail: string,
//   amount: number,
//   partyName: string,
//   partyId: string,
// ) => {
//   const accessToken = await getPayPalAccessToken();

//   const payoutBody = {
//     sender_batch_header: {
//       sender_batch_id: `refund_${Date.now()}_${partyId}`,
//       email_subject: 'Refund for leaving party',
//     },
//     items: [
//       {
//         recipient_type: 'EMAIL',
//         amount: {
//           value: amount.toFixed(2),
//           currency: 'USD',
//         },
//         receiver: receiverEmail,
//         note: `Refund for leaving party: ${partyName}`,
//         sender_item_id: `item_${Date.now()}`,
//       },
//     ],
//   };

//   const response = await axios.post(
//     'https://api.sandbox.paypal.com/v1/payments/payouts',
//     payoutBody,
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     },
//   );
//   return response.data;
// };

// // Helper function to get PayPal access token
// const getPayPalAccessToken = async (): Promise<string> => {
//   const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

//   const response = await axios.post(
//     'https://api.sandbox.paypal.com/v1/oauth2/token', // Change to sandbox URL for testing
//     'grant_type=client_credentials',
//     {
//       headers: {
//         Authorization: `Basic ${auth}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     },
//   );
//   return response.data.access_token;
// };

// const getAccessToken = async () => {
//   const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64');

//   const response = await axios.post(
//     'https://api.sandbox.paypal.com/v1/oauth2/token', // live endpoint; sandbox is different
//     'grant_type=client_credentials',
//     {
//       headers: {
//         Authorization: `Basic ${auth}`,
//         'Content-Type': 'application/x-www-form-urlencoded',
//       },
//     },
//   );
//   return response.data.access_token;
// };

// export const captureOrder = async (orderId: string) => {
//   const accessToken = await getAccessToken();

//   const response = await axios.post(
//     `https://api.sandbox.paypal.com/v2/checkout/orders/${orderId}/capture`, // live endpoint
//     {}, // empty body required for capture
//     {
//       headers: {
//         Authorization: `Bearer ${accessToken}`,
//         'Content-Type': 'application/json',
//       },
//     },
//   );

//   return response.data;
// };

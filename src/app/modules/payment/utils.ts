// paypalClient.ts
import paypal from '@paypal/checkout-server-sdk';
import config from '../../../config';

// const environment = new paypal.core.SandboxEnvironment(
//   config.paypal.client_id as string,
//   config.paypal.client_secret as string,
// );

// export const paypalClient = new paypal.core.PayPalHttpClient(environment);

// utils/paypalClient.ts

const clientId = config.paypal.client_id!;
const clientSecret = config.paypal.client_secret!;

const environment = new paypal.core.LiveEnvironment(clientId, clientSecret);

export const paypalClient = new paypal.core.PayPalHttpClient(environment);

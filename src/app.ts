/* eslint-disable no-undef */
import cors from 'cors';
import express, { Request, Response } from 'express';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import router from './routes';
import { Morgan } from './shared/morgen';
import notFoundRoute from './app/middlewares/notFoundRoute';
import path from 'path';
import { PaymentController } from './app/modules/payment/payment.controller';
import { wellKnownContentTypes } from './app/middlewares/wellKnownContentTypes';
import deeplinkRoutes from './app/modules/deeplink/deeplink.routes';

const app = express();

//morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);

//body parser
app.use(
  cors({
    origin: '*',
    credentials: true,
  }),
);

//webhook
app.post(
  '/webhook',
  express.raw({ type: 'application/json' }),
  PaymentController.paymentStripeWebhookController,
);

// app.use((req, res, next) => {
//   if (req.path.endsWith('apple-app-site-association')) {
//     res.type('application/json');
//   }
//   next();
// });

app.use(wellKnownContentTypes);

// body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(process.cwd(), 'public')));

app.use(express.static('uploads'));

// deeplink routes

app.use('/', deeplinkRoutes);

//router
app.use('/api/v1', router);

//live response
app.get('/', (req: Request, res: Response) => {
  res.send(
    '<h1 style="text-align:center; color:#A55FEF; font-family:Verdana;">welcome to distraction event management<h1>',
  );
});

//global error handle
app.use(globalErrorHandler);

//*handle not found route;

app.use(notFoundRoute);

export default app;

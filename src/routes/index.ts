import express from 'express';
import { AuthRoutes } from '../app/modules/auth/auth.route';
import { UserRoutes } from '../app/modules/user/user.route';
import { NotificationRoutes } from '../app/modules/notifications/notifications.route';
import { settingRoutes } from '../app/modules/setting/setting.route';
import { privacyRoutes } from '../app/modules/privacy/privacy.routes';
import { aboutRoutes } from '../app/modules/aboutUs/aboutUs.route';
import { tersmConditionRoutes } from '../app/modules/termsAndCondition/termsAndCondition.route';
import { partyRoute } from '../app/modules/party/party.route';
import { SavedPartyRoutes } from '../app/modules/savedParty/savedParty.route';
import { shopCategoryRoutes } from '../app/modules/shopCategory/shopCategory.route';
import { ShopRoutes } from '../app/modules/shop/shop.route';
import { ChatGroupRoutes } from '../app/modules/chatGroup/chatGroup.route';
import { messageRoutes } from '../app/modules/message/message.route';
import { hostPayoutRoutes } from '../app/modules/payoutHost/payoutHost.route';
import { refundUserRoutes } from '../app/modules/payoutUser/payoutUser.route';
import { PaymentRoutes } from '../app/modules/payment/payment.route';

const router = express.Router();

const apiRoutes = [
  { path: '/user', route: UserRoutes },
  { path: '/auth', route: AuthRoutes },

  { path: '/notification', route: NotificationRoutes },
  { path: '/setting', route: settingRoutes },
  { path: '/privacy', route: privacyRoutes },
  { path: '/about', route: aboutRoutes },
  { path: '/terms', route: tersmConditionRoutes },
  { path: '/party', route: partyRoute },
  { path: '/saved-party', route: SavedPartyRoutes },
  { path: '/shop-category', route: shopCategoryRoutes },
  { path: '/shop', route: ShopRoutes },
  { path: '/chat-group', route: ChatGroupRoutes },
  { path: '/message', route: messageRoutes },
  { path: '/payout', route: hostPayoutRoutes },
  { path: '/refund', route: refundUserRoutes },

  { path: '/payment', route: PaymentRoutes },
  // { path: '/package', route: packageRoute },
  // { path: '/subscription', route: SubscriptionRoutes },
];

apiRoutes.forEach(route => router.use(route.path, route.route));

export default router;

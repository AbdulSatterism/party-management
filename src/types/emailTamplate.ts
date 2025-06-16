export type ICreateAccount = {
  name: string;
  email: string;
  otp: number;
};

export type IResetPassword = {
  email: string;
  otp: number;
};

export type IHostApproval = {
  email: string;
  hostName: string;
};

export type IPartyJoinConfirmation = {
  email: string;
  partyName: string;
  partyDate: string;
  ticketCount: number;
  totalPrice: string;
};

export type IPayoutConfirmation = {
  email: string;
  partyName: string;
  amount: number;
  status: string;
  paypalBatchId: string;
};

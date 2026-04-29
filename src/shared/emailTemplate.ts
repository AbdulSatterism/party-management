import {
  ICreateAccount,
  IHostApproval,
  IPartyJoinConfirmation,
  IPayoutConfirmation,
  IResetPassword,
} from '../types/emailTamplate';

const createAccount = (values: ICreateAccount) => {
  const data = {
    to: values.email,
    subject: 'Verify your account',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
    <div style="background-color: #E73E1E; padding: 25px; text-align: center;">
      <h2 style="color: white; margin: 0; font-size: 22px;">Welcome to Our Platform!</h2>
    </div>
    
    <div style="padding: 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6; margin-bottom: 25px;">
        Hi ${values.name},<br><br>
        Thank you for creating an account. Here's your verification code:
      </p>
      
      <div style="background-color: #FB9400; color: white; font-size: 24px; font-weight: bold; 
           padding: 12px 0; text-align: center; border-radius: 6px; width: 140px; margin: 0 auto 25px; 
           letter-spacing: 3px;">
        ${values.otp}
      </div>
      
      <p style="color: #666; font-size: 15px; line-height: 1.6; text-align: center; margin-bottom: 25px;">
        This code expires in 20 minutes
      </p>
      
      <p style="color: #888; font-size: 14px; line-height: 1.5; border-top: 1px solid #eee; 
         padding-top: 20px; margin-bottom: 0;">
        If you didn't request this code, please ignore this email. Someone may have entered your email by mistake.
      </p>
    </div>
    
    <div style="background-color: #f9f9f9; padding: 15px; text-align: center; font-size: 12px; color: #999;">
      © ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>
  </div>
</body>`,
  };
  return data;
};

const resetPassword = (values: IResetPassword) => {
  const data = {
    to: values.email,
    subject: 'Reset your password',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f5f5f5; margin: 0; padding: 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.05); overflow: hidden;">
    
    <!-- Header -->
    <div style="background-color: #E73E1E; padding: 25px; text-align: center;">
      <h2 style="color: #ffffff; margin: 0; font-size: 24px; font-weight: bold;">Password Reset Verification</h2>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 30px;">
      
      <p style="color: #333333; font-size: 16px; line-height: 1.5; text-align: center; margin-bottom: 30px;">
        Use the following One-Time Password (OTP) to reset your password:
      </p>

      <div style="background-color: #FB9400; color: #ffffff; font-size: 28px; font-weight: bold; 
           padding: 14px 0; text-align: center; border-radius: 8px; width: 160px; margin: 0 auto 30px; 
           letter-spacing: 4px;">
        ${values.otp}
      </div>

      <p style="color: #666666; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 30px;">
        This code will expire in 20 minutes.<br>
        If you did not request this, please ignore this email.
      </p>
      
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f0f0f0; padding: 15px; text-align: center; font-size: 12px; color: #999999;">
      © ${new Date().getFullYear()} Your Company. All rights reserved.
    </div>
  </div>
</body>
`,
  };
  return data;
};

const hostApproval = (values: IHostApproval) => {
  const data = {
    to: values.email,
    subject: 'Host Approval Notification',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 30px auto; background-color: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
    <!-- Header with accent color -->
    <div style="background-color: #E73E1E; padding: 20px; text-align: center;">
      <h2 style="color: white; margin: 0; font-size: 24px;">Party Management</h2>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #E73E1E; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
          </svg>
        </div>
        <h1 style="color: #333; font-size: 28px; font-weight: 600; margin-bottom: 15px;">Welcome Aboard!</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 10px;">
          Dear ${values.hostName},
        </p>
      </div>
      
      <div style="background-color: #FFF5F4; border-left: 4px solid #E73E1E; padding: 15px; margin-bottom: 30px;">
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0;">
          We're thrilled to inform you that your request to become a host has been <strong style="color: #E73E1E;">approved</strong>!
        </p>
      </div>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">
        You're now officially part of our hosting community! As a verified host, you can:
      </p>
      
      <ul style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 30px; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Create and manage exciting events</li>
        <li style="margin-bottom: 10px;">Connect with enthusiastic attendees</li>
        <li style="margin-bottom: 10px;">Access exclusive host resources</li>
      </ul>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 10px;">
        You can now log in to your account to start creating your first event.
      </p>
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="font-size: 14px; color: #888; margin-bottom: 10px;">
        Need help? Contact our support team at <a href="mailto:hello@distractionhq.com" style="color: #E73E1E; text-decoration: none;">hello@distractionhq.com</a>
      </p>
      <p style="font-size: 12px; color: #aaa; margin: 0;">
        © 2023 Host Platform. All rights reserved.
      </p>
    </div>
  </div>
</body>`,
  };
  return data;
};

const HostRejected = (values: IHostApproval) => {
  const data = {
    to: values.email,
    subject: 'Host Approval Notification',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 30px auto; background-color: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
    <!-- Header -->
    <div style="background-color: #E73E1E; padding: 20px; text-align: center;">
      <h2 style="color: white; margin: 0; font-size: 24px;">Party Management</h2>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <h1 style="color: #333; font-size: 24px; font-weight: 600; margin-bottom: 15px;">Rejected Host Request</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 10px;">
          Dear ${values.hostName},
        </p>
      </div>
      
      <div style="background-color: #FFF5F4; border-left: 4px solid #E73E1E; padding: 15px; margin-bottom: 30px;">
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0;">
          After careful review, we regret to inform you that your host application has not been approved at this time.
        </p>
      </div>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">
        Your documents were reviewed by our admin team and may contain invalid or incomplete information. Please:
      </p>
      
      <ol style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 30px; padding-left: 20px;">
        <li style="margin-bottom: 10px;">Review all submitted documents</li>
        <li style="margin-bottom: 10px;">Ensure all information is valid and complete</li>
        <li style="margin-bottom: 10px;">Resubmit your host application</li>
      </ol>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6;">
        We appreciate your interest in becoming a host and encourage you to apply again after making the necessary corrections.
      </p>
    </div>
   
    </div>
  </div>
</body>`,
  };
  return data;
};

const partyJoinedConfirmation = (values: IPartyJoinConfirmation) => {
  const data = {
    to: values.email,
    subject: 'Party join confirmation',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 30px auto; background-color: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
    <!-- Header with accent color -->
    <div style="background-color: #E73E1E; padding: 20px; text-align: center;">
      <h2 style="color: white; margin: 0; font-size: 24px;">Party Confirmation</h2>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #E73E1E; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 16.17L4.83 12L3.41 13.41L9 19L21 7L19.59 5.59L9 16.17Z" fill="white"/>
          </svg>
        </div>
        <h1 style="color: #333; font-size: 28px; font-weight: 600; margin-bottom: 15px;">Congratulations!</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 10px;">
          You've successfully joined the party!
        </p>
      </div>
      
      <div style="background-color: #FFF5F4; border-left: 4px solid #E73E1E; padding: 15px; margin-bottom: 30px;">
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0;">
          Here are your ticket details:
        </p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #555;">Party Name:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #333; font-weight: 600; text-align: right;">${values.partyName}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #555;">Date:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #333; font-weight: 600; text-align: right;">${values.partyDate}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #555;">Tickets:</td>
            <td style="padding: 8px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #333; font-weight: 600; text-align: right;">${values.ticketCount}</td>
          </tr>
          <tr>
            <td style="padding: 8px 0; font-size: 16px; color: #555;">Total Price:</td>
            <td style="padding: 8px 0; font-size: 16px; color: #E73E1E; font-weight: 700; text-align: right;">£ ${values.totalPrice}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">
        We're excited to see you at the event! Your ticket details will be sent separately.
      </p>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 10px;">
        If you have any questions, feel free to reach out to us.
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="font-size: 14px; color: #888; margin-bottom: 10px;">
        Questions about your ticket? Contact us at <a href="mailto:hello@distractionhq.com" style="color: #E73E1E; text-decoration: none;">hello@distractionhq.com</a>
      </p>
      <p style="font-size: 12px; color: #aaa; margin: 0;">
        © 2023 Party Management. All rights reserved.
      </p>
    </div>
  </div>
</body>`,
  };
  return data;
};

const poyoutHostConfirmation = (values: IPayoutConfirmation) => {
  const data = {
    to: values.email,
    subject: 'Party join confirmation',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 600px; margin: 30px auto; background-color: #fff; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.08); overflow: hidden;">
    <!-- Header with accent color -->
    <div style="background-color: #E73E1E; padding: 20px; text-align: center;">
      <h2 style="color: white; margin: 0; font-size: 24px;">Payment Confirmation</h2>
    </div>
    
    <!-- Main Content -->
    <div style="padding: 40px 30px;">
      <div style="text-align: center; margin-bottom: 30px;">
        <div style="background-color: #E73E1E; width: 60px; height: 60px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 20px;">
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM10 17L5 12L6.41 10.59L10 14.17L17.59 6.58L19 8L10 17Z" fill="white"/>
          </svg>
        </div>
        <h1 style="color: #333; font-size: 28px; font-weight: 600; margin-bottom: 15px;">Payout Successful!</h1>
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 10px;">
          Your earnings have been successfully transferred.
        </p>
      </div>
      
      <div style="background-color: #FFF5F4; border-left: 4px solid #E73E1E; padding: 15px; margin-bottom: 30px;">
        <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0;">
          <strong style="color: #E73E1E;">Payment processed:</strong>£ ${values.amount} for ${values.partyName}
        </p>
      </div>
      
      <div style="margin-bottom: 30px;">
        <table style="width: 100%; border-collapse: collapse;">
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #555;">Event:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #333; font-weight: 600; text-align: right;">${values.partyName}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #555;">Amount:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #E73E1E; font-weight: 700; text-align: right;">£ ${values.amount}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #555;">Status:</td>
            <td style="padding: 12px 0; border-bottom: 1px solid #eee; font-size: 16px; color: #4CAF50; font-weight: 600; text-align: right;">${values.status}</td>
          </tr>
          <tr>
            <td style="padding: 12px 0; font-size: 16px; color: #555;">Transaction ID:</td>
            <td style="padding: 12px 0; font-size: 16px; color: #333; font-weight: 600; text-align: right;">${values.paypalBatchId}</td>
          </tr>
        </table>
      </div>
      
      <p style="font-size: 16px; color: #555; line-height: 1.6; margin-bottom: 25px;">
        The payment should appear in your account within 2 or 1 business days. If you don't see the payment, please check your PayPal account directly or contact with the admin.
      </p>
      
    </div>
    
    <!-- Footer -->
    <div style="background-color: #f5f5f5; padding: 20px; text-align: center; border-top: 1px solid #eee;">
      <p style="font-size: 14px; color: #888; margin-bottom: 10px;">
        Need help? Contact our support team at <a href="mailto:hello@distractionhq.com" style="color: #E73E1E; text-decoration: none;">hello@distractionhq.com</a>
      </p>
      <p style="font-size: 12px; color: #aaa; margin: 0;">
        © 2023 Party Management. All rights reserved.
      </p>
    </div>
  </div>
</body>`,
  };
  return data;
};

export interface IleaveParty {
  userName: string;
  partyName: string;
  hostName: string;
  returnAmount: number;
  transactionId: string;
  hostContact: string;
  email: string;
}

const leaveFromParty = (values: IleaveParty) => {
  const data = {
    to: values.email,
    subject: 'Party join confirmation',
    html: `<body style="font-family: Arial, sans-serif; background-color: #f9f9f9; margin: 0; padding: 0;">
  <div style="width: 100%; max-width: 520px; margin: 20px auto; background-color: #fff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); overflow: hidden;">
    
    <!-- Mini header -->
    <div style="background-color: #E73E1E; padding: 14px 20px; text-align: center;">
      <h2 style="color: white; margin: 0; font-size: 20px;">Party Management</h2>
    </div>
    
    <!-- Compact body -->
    <div style="padding: 24px 24px 20px;">
      
      <!-- Greeting & status -->
      <div style="text-align: center; margin-bottom: 20px;">
        <div style="background-color: #E73E1E; width: 48px; height: 48px; border-radius: 50%; display: inline-flex; align-items: center; justify-content: center; margin-bottom: 12px;">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M10.09 15.59L11.5 17L16.5 12L11.5 7L10.09 8.41L12.67 11H3V13H12.67L10.09 15.59Z" fill="white"/>
            <path d="M19 3H5C3.89 3 3 3.9 3 5V9H5V5H19V19H5V15H3V19C3 20.1 3.89 21 5 21H19C20.1 21 21 20.1 21 19V5C21 3.9 20.1 3 19 3Z" fill="white"/>
          </svg>
        </div>
        <h3 style="color: #222; font-size: 20px; margin: 0 0 4px;">Left party successfully</h3>
        <p style="color: #666; font-size: 14px; margin: 0;">We've processed your withdrawal</p>
      </div>
      
      <!-- Personal greeting -->
      <p style="font-size: 15px; color: #333; margin: 0 0 12px;">Hello <strong>${values.userName}</strong>,</p>
      
      <!-- Summary card: party, host, return amount + TRANSACTION ID -->
      <div style="background: #FFF5F4; border-radius: 12px; padding: 14px 16px; margin-bottom: 16px; border-left: 3px solid #E73E1E;">
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-size: 14px; color: #666;">🎉 Party:</span>
          <span style="font-weight: 600; color: #222;">${values.partyName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-size: 14px; color: #666;">👤 Host:</span>
          <span style="font-weight: 600; color: #222;">${values.hostName}</span>
        </div>
        <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
          <span style="font-size: 14px; color: #666;">🆔 Transaction ID:</span>
          <span style="font-weight: 600; font-family: monospace; background: #FFE8E3; padding: 2px 6px; border-radius: 20px; font-size: 13px;">${values.transactionId}</span>
        </div>
        <div style="display: flex; justify-content: space-between; padding-top: 8px; border-top: 1px solid #FFD9D2;">
          <span style="font-size: 15px; font-weight: 600; color: #E73E1E;">💰 Return amount:</span>
          <span style="font-size: 18px; font-weight: 800; color: #E73E1E;">${values.returnAmount}</span>
        </div>
      </div>
      
      <!-- Contact block (host + admin) -->
      <div style="background-color: #F8F8F8; border-radius: 12px; padding: 12px 12px; margin-bottom: 16px;">
        <p style="font-size: 13px; font-weight: 600; color: #444; margin: 0 0 10px 4px;"> ✉️ Contacts</p>
        <div style="display: flex; gap: 12px; flex-wrap: wrap;">
          <div style="flex: 1; background: white; border-radius: 10px; padding: 8px 12px;">
            <p style="margin: 0; font-size: 12px; color: #888;">Host contact</p>
            <p style="margin: 2px 0 0; font-weight: 600; color: #E73E1E; font-size: 14px;">${values.hostContact}</p>
          </div>
          <div style="flex: 1; background: white; border-radius: 10px; padding: 8px 12px;">
            <p style="margin: 0; font-size: 12px; color: #888;">Admin support</p>
            <p style="margin: 2px 0 0; font-weight: 600; color: #E73E1E; font-size: 14px;">distraction.play.store@gmail.com</p>
          </div>
        </div>
      </div>
      
      <!-- Short note -->
      <p style="font-size: 13px; color: #555; margin: 10px 0 0; text-align: center;">
        Refund will be processed within 5–7 days. Keep your Transaction ID for reference.
      </p>
    </div>
    
    <!-- Simple footer -->
    <div style="background-color: #f5f5f5; padding: 14px; text-align: center; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #888; margin: 0;">
        © 2025 Party Management · <a href="mailto: distraction.play.store@gmail.com" style="color: #E73E1E; text-decoration: none;">Help Center</a>
      </p>
    </div>
  </div>
</body>`,
  };
  return data;
};

export const emailTemplate = {
  createAccount,
  resetPassword,
  hostApproval,
  HostRejected,
  partyJoinedConfirmation,
  poyoutHostConfirmation,
  leaveFromParty,
};

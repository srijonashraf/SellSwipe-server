const commonStyles = `
  font-family: Helvetica, Arial, sans-serif; 
  min-width: 1000px; 
  overflow: auto; 
  line-height: 2;
`;

const commonFooter = `
  <hr style="border: none; border-top: 1px solid #eee;" />
  <div style="float: right; padding: 8px 0; color: #aaa; font-size: 0.8em; line-height: 1; font-weight: 300;">
    <p>SellSwipe Team</p>
    <p>Dhanmondi, Dhaka</p>
    <p>Bangladesh</p>
  </div>
`;

const emailTemplate = (title, content) => `
  <!DOCTYPE html>
  <html lang="en">
    <head>
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
      <title>${title}</title>
    </head>
    <body style="${commonStyles}">
      <div style="margin: 50px auto; width: 70%; padding: 20px 0;">
        <div style="border-bottom: 1px solid #eee;">
          <a href="#" style="font-size: 1.4em; color: #00466a; text-decoration: none; font-weight: 600;">${title}</a>
        </div>
        <div style="font-size: 1.1em;">
          ${content}
          ${commonFooter}
        </div>
      </div>
    </body>
  </html>
`;

export const emailVerificationTemplate = ({
  title = "Verify Your Email",
  name = "",
  link = "",
}) => {
  const subject = "Verify Your Email - SellSwipe";
  const content = `
    <p>Hi ${name},</p>
    <p>Your account has been successfully created. Please verify your email address by clicking the link below:</p>
    <p><a href="${link}" style="color: #00466a;">Email Verification Link</a></p>
    <p>The link is valid for 5 minutes.</p>
     <p style="font-size: 0.9em;">Best regards,<br />The SellSwipe Team</p>

  `;
  return { subject, htmlContent: emailTemplate(title, content) };
};

export const resetPasswordTemplate = ({
  title = "Reset Your Password - SellSwipe",
  name = "",
  link = "",
  otp = "",
}) => {
  const subject = "Reset Your Password - SellSwipe";
  const content = `
    <p>Hi ${name},</p>
    <p>We received a password reset request for your account. Please reset your password by clicking the link below:</p>
    <p><a href="${link}" style="color: #00466a;">Reset Password Link</a></p>
    <p>Alternatively, you can use the following OTP:</p>
    <h2 style="background: #00466a; margin: 0 auto; width: max-content; padding: 0 10px; color: #fff; border-radius: 4px;">${otp}</h2>
    <p>Both the link and OTP are valid for 5 minutes.</p>
      <p style="font-size: 0.9em;">Best regards,<br />The SellSwipe Team</p>

  `;
  return { subject, htmlContent: emailTemplate(title, content) };
};

export const afterEmailVerificationTemplate = ({
  title = "Welcome to SellSwipe",
  name = "",
}) => {
  const subject = "Welcome to SellSwipe";
  const content = `
    <p>Hi ${name},</p>
    <p>Welcome to SellSwipe! Your email has been verified. You can now log in and enjoy full access to SellSwipe.</p>
      <p style="font-size: 0.9em;">Best regards,<br />The SellSwipe Team</p>

  `;
  return { subject, htmlContent: emailTemplate(title, content) };
};

export const afterResetPasswordTemplate = ({
  title = "Password Reset Successful",
  name = "",
  ip = "",
  location = {},
  device = "",
  time = "",
}) => {
  const subject = "Password Reset Successful - SellSwipe";
  const content = `
    <p>Hi ${name},</p>
    <p>Your password has been successfully reset. If you did not request this change, please contact our support team immediately.</p>
    <p><strong>Details:</strong></p>
    <ul>
      <li><strong>IP Address:</strong> ${ip}</li>
      <li><strong>Location:</strong> 
      <ul>
      <li>${location.country}</li>
      <li>${location.regionName}</li>
      </ul>
      </li>
      <li><strong>Device:</strong> ${device}</li>
      <li><strong>Time:</strong> ${time}</li>
    </ul>
    <p>Thank you,</p>
      <p style="font-size: 0.9em;">Best regards,<br />The SellSwipe Team</p>
  `;
  return { subject, htmlContent: emailTemplate(title, content) };
};

export const warningAccountTemplate = ({
  title = "Unusual Activity Detected on Your Account",
  name = "",
}) => {
  const subject = "Warning: Unusual Activity Detected - SellSwipe";
  const content = `
  <p>Hi ${name},</p>
  <p>We are writing to inform you that we have detected some unusual activities on your account that may violate our community standards.</p>
  <p>Please be aware that continuing to engage in such activities could result in permanent action against your account, including the possibility of it being blocked. We urge you to review our <a href="https://sellswipe.com/terms">terms of service</a> to ensure your actions comply with our guidelines.</p>
  <p>If you believe this warning has been issued in error or if you have any questions about the reason of warning, please do not hesitate to contact our support team at <a href="mailto:support@sellswipe.com">support@sellswipe.com</a>.</p>
  <p>We value your presence on our platform and hope this matter can be resolved promptly.</p>
  <p style="font-size: 0.9em;">Best regards,<br />The SellSwipe Team</p>
`;
  return { subject, htmlContent: emailTemplate(title, content) };
};

export const restrictAccountTemplate = ({
  title = "Your account has permanently blocked",
  name = "",
}) => {
  const subject = "Your account has permanently blocked - SellSwipe";
  const content = `
 <p>Hi ${name},</p>
  <p>We regret to inform you that your account has been permanently blocked due to some unusual activities that violate our community standards.</p>
  <p>Please be advised that this decision was made after careful consideration, and we have determined that your actions are not in line with our terms of service. We take the security and integrity of our platform very seriously, and this measure is necessary to protect our users.</p>
  <p>If you believe this action was taken in error or if you would like to appeal this decision, please contact our support team at <a href="mailto:cyber.srijon@gmail.com">support@sellswipe.com</a> with any relevant details.</p>
  <p>Thank you for your understanding.</p>
  <p style="font-size: 0.9em;">Best regards,<br />The SellSwipe Team</p>
`;
  return { subject, htmlContent: emailTemplate(title, content) };
};

export const promotionalEmailTemplate = ({
  title = "",
  subject = "",
  name = "",
  content = "",
}) => {
  const emailContent = `
  <p>Hi ${name},</p>
  ${content}
  <p style="font-size: 0.9em;">Best regards,<br />The SellSwipe Team</p>
`;
  return { subject, htmlContent: emailTemplate(title, emailContent) };
};

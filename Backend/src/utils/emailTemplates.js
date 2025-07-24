// utils/emailTemplates.js

export const generateVerificationEmail = (verificationCode) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #333;">Welcome to Our App 👋</h2>
      <p style="color: #555; font-size: 16px;">Thank you for registering. Please use the following verification code to verify your email:</p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="display: inline-block; background-color: #007bff; color: white; padding: 12px 20px; font-size: 20px; border-radius: 6px; letter-spacing: 3px;">
          ${verificationCode}
        </span>
      </div>
      <p style="color: #888; font-size: 14px;">This code will expire in 10 minutes.</p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 13px; color: #aaa;">If you did not create an account, you can safely ignore this email.</p>
    </div>
  </div>`;
};

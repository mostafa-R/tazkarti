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

export const sendAcceptEmail = (eventTitle) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #28a745;">Event Approved ✅</h2>
      <p style="color: #555; font-size: 16px;">
        Congratulations! Your event has been successfully reviewed and approved.
      </p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="display: inline-block; background-color: #28a745; color: white; padding: 12px 20px; font-size: 20px; border-radius: 6px; letter-spacing: 1px;">
          ${eventTitle}
        </span>
      </div>
      <p style="color: #555; font-size: 16px;">
        You can now view your event live on the platform. Thank you for contributing to our community.
      </p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 13px; color: #aaa;">
        If you have any questions, feel free to contact our support team.
      </p>
    </div>
  </div>`;
};

export const sendRejectEmail = (eventTitle) => {
  return `
  <div style="font-family: Arial, sans-serif; background-color: #f9f9f9; padding: 20px;">
    <div style="max-width: 500px; margin: auto; background: white; padding: 30px; border-radius: 8px; box-shadow: 0 0 10px rgba(0,0,0,0.1);">
      <h2 style="color: #d9534f;">Event Rejected ❌</h2>
      <p style="color: #555; font-size: 16px;">
        We regret to inform you that your submitted event titled:
      </p>
      <div style="margin: 20px 0; text-align: center;">
        <span style="display: inline-block; background-color: #dc3545; color: white; padding: 12px 20px; font-size: 20px; border-radius: 6px; letter-spacing: 1px;">
          ${eventTitle}
        </span>
      </div>
      <p style="color: #555; font-size: 16px;">
        was not approved after review. If you believe this was a mistake or would like more information, feel free to contact our support team.
      </p>
      <hr style="margin: 30px 0;" />
      <p style="font-size: 13px; color: #aaa;">This is an automated message. Please do not reply directly to this email.</p>
    </div>
  </div>`;
};

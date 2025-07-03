import { transporter } from "../config/email.js";

export const sendEmail = async (to, subject, text, html = null) => {
  try {
    const info = await transporter.sendMail({
      from: {
        name: "Tazkarti App",
        address: process.env.EMAIL_FROM,
      },
      to,
      subject,
      text,
      html,
    });
    console.log(" Email sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error("Email Error:", {
      message: error.message,
      stack: error.stack,
      to,
      subject,
    });
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

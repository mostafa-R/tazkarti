import { transporter } from "../config/email.js";

export const sendEmail = async (to, subject, link) => {
  try {
    const info = await transporter.sendMail({
      from: {
        name: "Tazkarti App",
        address: process.env.EMAIL_FROM,
      },
      to,
      subject,
      html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 20px; background-color: #f7f7f7; color: #333;">
        <div style="max-width: 600px; margin: auto; background-color: #ffffff; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
          <div style="background-color: #0d6efd; padding: 20px; color: white; text-align: center;">
            <h2 style="margin: 0;">Tazkarti App</h2>
            <p style="margin: 5px 0 0;">مرحبا بك في عالم الفعاليات!</p>
          </div>
    
          <div style="padding: 30px;">
            <h3 style="margin-bottom: 15px;">مرحباً ${to.split("@")[0]} 👋</h3>
            <p style="line-height: 1.6;">
              شكراً لتسجيلك في منصة <strong>Tazkarti</strong>! <br>
              من فضلك اضغط على الزر أدناه لتفعيل حسابك.
            </p>
    
            <div style="text-align: center; margin: 30px 0;">
              <a href="${link}" target="_blank" style="
                background-color: #0d6efd;
                color: white;
                padding: 12px 25px;
                text-decoration: none;
                border-radius: 5px;
                display: inline-block;
                font-size: 16px;
              ">تفعيل الحساب</a>
            </div>
    
            <p style="font-size: 14px; color: #666;">
              إذا لم تقم بالتسجيل، يمكنك تجاهل هذه الرسالة. لن يتم إنشاء الحساب بدون تأكيد.
            </p>
    
            <hr style="border: none; border-top: 1px solid #ddd; margin: 40px 0;">
    
            <p style="text-align: center; font-size: 13px; color: #aaa;">
              مع تحيات فريق عمل Tazkarti 
            </p>
          </div>
        </div>
      </div>
    `,
    });
    console.log(" Email sent:", info.messageId);
  } catch (error) {
    console.error("Email Error:", error.message);
  }
};

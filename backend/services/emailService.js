import nodemailer from "nodemailer";

let transporterPromise;

const createTransporter = async () => {
  if (transporterPromise) {
    return transporterPromise;
  }

  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

  if (SMTP_HOST && SMTP_PORT && SMTP_USER && SMTP_PASS) {
    transporterPromise = Promise.resolve(
      nodemailer.createTransport({
        host: SMTP_HOST,
        port: Number(SMTP_PORT),
        secure: Number(SMTP_PORT) === 465,
        auth: {
          user: SMTP_USER,
          pass: SMTP_PASS,
        },
      })
    );

    return transporterPromise;
  }

  transporterPromise = Promise.resolve(null);
  return transporterPromise;
};

export const sendResetPasswordEmail = async ({ to, name, resetUrl }) => {
  const transporter = await createTransporter();

  if (!transporter) {
    console.log(`Password reset link for ${to}: ${resetUrl}`);
    return {
      delivered: false,
      previewUrl: resetUrl,
    };
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to,
      subject: "Finora password reset",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.5;">
          <h2>Reset your Finora password</h2>
          <p>Hello ${name || "there"},</p>
          <p>We received a request to reset your password. This link expires in 15 minutes.</p>
          <p><a href="${resetUrl}" style="color: #0d6efd;">Reset Password</a></p>
          <p>If you did not request this, you can ignore this email.</p>
        </div>
      `,
    });
  } catch (error) {
    console.log(`Email send failed for ${to}. Reset link: ${resetUrl}`);
    return {
      delivered: false,
      previewUrl: resetUrl,
      message: error.message,
    };
  }

  return {
    delivered: true,
  };
};

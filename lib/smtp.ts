import nodemailer from "nodemailer";

export function getTransporter() {
  const host = process.env.SMTP_HOST || "smtp.gmail.com";
  const port = Number(process.env.SMTP_PORT || 465);
  const secure = (process.env.SMTP_SECURE ?? (port === 465 ? "true" : "false")) === "true";
  const user = process.env.SMTP_USER || process.env.HOSTINGER_EMAIL;
  const pass = process.env.SMTP_PASS || process.env.HOSTINGER_PASSWORD;

  return nodemailer.createTransport({
    host,
    port,
    secure,
    auth: {
      user,
      pass,
    },
  });
}

export async function verifyTransporter() {
  const transporter = getTransporter();
  try {
    await transporter.verify();
    return true;
  } catch (e) {
    console.error("SMTP verify failed:", e);
    return false;
  }
}

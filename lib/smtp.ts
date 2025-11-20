import nodemailer from "nodemailer";

export function getTransporter() {
  // Check if we have email credentials
  const user = process.env.SMTP_USER || process.env.HOSTINGER_EMAIL || process.env.EMAIL_USER;
  const pass = process.env.SMTP_PASS || process.env.HOSTINGER_PASSWORD || process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn("Email credentials not configured. Emails will not be sent.");
    // Return a dummy transporter that won't actually send
    return nodemailer.createTransport({
      streamTransport: true,
      newline: 'unix',
      buffer: true
    });
  }

  // Use Gmail service for better Vercel compatibility
  // This works better on serverless functions than manual SMTP configuration
  return nodemailer.createTransport({
    service: 'gmail',
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

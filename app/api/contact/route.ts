import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, device, issue, message } = await request.json();

    // Validate required fields
    if (!name || !email || !phone || !device || !issue) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Create a transporter using Hostinger SMTP settings
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true, // true for 465, false for other ports
      auth: {
        user: process.env.HOSTINGER_EMAIL, // Your Hostinger email
        pass: process.env.HOSTINGER_PASSWORD, // Your Hostinger email password
      },
    });

    // Email content
    const mailOptions = {
      from: process.env.HOSTINGER_EMAIL,
      to: process.env.ADMIN_EMAIL || process.env.HOSTINGER_EMAIL, // Send to admin email
      replyTo: email, // Customer's email for easy reply
      subject: `New Contact Form Submission - ${device} Repair`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333; border-bottom: 2px solid #4CAF50; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">Customer Information</h3>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
            <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">Device & Issue Details</h3>
            <p><strong>Device Model:</strong> ${device}</p>
            <p><strong>Issue Type:</strong> ${issue}</p>
          </div>
          
          ${
            message
              ? `
          <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
            <h3 style="color: #555; margin-top: 0;">Additional Details</h3>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          `
              : ""
          }
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #777; font-size: 12px;">
            <p>This email was sent from your website's contact form.</p>
            <p>Submission time: ${new Date().toLocaleString()}</p>
          </div>
        </div>
      `,
      text: `
New Contact Form Submission

Customer Information:
- Name: ${name}
- Email: ${email}
- Phone: ${phone}

Device & Issue Details:
- Device Model: ${device}
- Issue Type: ${issue}

${message ? `Additional Details:\n${message}` : ""}

Submission time: ${new Date().toLocaleString()}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Email sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending email:", error);
    return NextResponse.json(
      { error: "Failed to send email. Please try again later." },
      { status: 500 }
    );
  }
}

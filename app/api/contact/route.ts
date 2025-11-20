import { NextRequest, NextResponse } from "next/server";
import { getTransporter } from "@/lib/smtp";
import connectDB from "@/lib/mongodb";
import mongoose from "mongoose";

// Contact submission schema
const contactSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  device: String,
  issue: String,
  message: String,
  createdAt: { type: Date, default: Date.now },
});

// Check if model exists, otherwise create it
const Contact =
  mongoose.models.Contact || mongoose.model("Contact", contactSchema);

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

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Save to MongoDB first
    let savedToDb = false;
    try {
      await connectDB();
      await Contact.create({
        name,
        email,
        phone,
        device,
        issue,
        message,
      });
      savedToDb = true;
    } catch (dbError) {
      console.error("Database save error:", dbError);
      // Continue with email sending even if DB save fails
    }

    // Check if email credentials are configured
    const hasEmailCreds = !!(
      process.env.SMTP_USER ||
      process.env.HOSTINGER_EMAIL ||
      process.env.EMAIL_USER
    ) && !!(
      process.env.SMTP_PASS ||
      process.env.HOSTINGER_PASSWORD ||
      process.env.EMAIL_PASS
    );

    let emailSent = false;

    if (!hasEmailCreds) {
      console.warn("Email credentials not configured. Skipping email send.");
    } else {
      try {
        // Create transporter from centralized SMTP helper
        const transporter = getTransporter();

        // Email content
        const mailOptions = {
          from: `"FOTG Mobile Repair" <${process.env.HOSTINGER_EMAIL || process.env.EMAIL_USER}>`,
          to: process.env.ADMIN_EMAIL || process.env.HOSTINGER_EMAIL || process.env.EMAIL_RECEIVER,
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
              
              ${message
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
Name: ${name}
Email: ${email}
Phone: ${phone}

Device & Issue Details:
Device Model: ${device}
Issue Type: ${issue}

${message ? `Additional Details:\n${message}` : ""}

Submission time: ${new Date().toLocaleString()}
          `,
        };

        // Send email (don't block response if it fails)
        await transporter.sendMail(mailOptions);
        emailSent = true;
      } catch (emailError) {
        console.error("Email send error:", emailError);
        // Don't throw - we already saved to DB
      }
    }

    // Return success if either DB save or email send succeeded
    if (!savedToDb && !emailSent) {
      return NextResponse.json(
        { error: "Failed to save contact submission" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: emailSent && savedToDb
          ? "Contact form submitted and email sent successfully"
          : savedToDb
            ? "Contact form submitted successfully (email notification pending)"
            : "Email sent successfully",
        savedToDb,
        emailSent,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error processing contact form:", error);
    return NextResponse.json(
      { error: "Failed to process contact form. Please try again later." },
      { status: 500 }
    );
  }
}

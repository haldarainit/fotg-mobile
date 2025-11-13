import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(request: NextRequest) {
  try {
    const {
      deviceType,
      brand,
      model,
      color,
      repairs,
      serviceMethod,
      customerType,
      firstName,
      lastName,
      phone,
      email,
      notes,
      total,
      pricing,
    } = await request.json();

    // Validate required fields
    if (!firstName || !lastName || !phone || !email || !serviceMethod) {
      return NextResponse.json(
        { error: "All required fields must be filled" },
        { status: 400 }
      );
    }

    // Create a transporter using Hostinger SMTP settings
    const transporter = nodemailer.createTransport({
      host: "smtp.hostinger.com",
      port: 465,
      secure: true,
      auth: {
        user: process.env.HOSTINGER_EMAIL,
        pass: process.env.HOSTINGER_PASSWORD,
      },
    });

    // Get service method details
    const serviceMethodText =
      serviceMethod === "location"
        ? "Bring to our location"
        : "At home with pick-up & delivery";

    // Format repairs list (include selected part quality when available)
    const repairsList = repairs
      .map((repair: any) => {
        const qualityLabel = repair.partQuality && repair.partQuality.name ? ` <strong>(${repair.partQuality.name})</strong>` : "";
        return `<li>${repair.name}${qualityLabel} - $${repair.price} (${repair.duration})</li>`;
      })
      .join("");

    // Email content
    const mailOptions = {
      from: process.env.HOSTINGER_EMAIL,
      to: process.env.ADMIN_EMAIL || process.env.HOSTINGER_EMAIL,
      replyTo: email,
      subject: `New Quote Request - ${model.name} Repair - $${total}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0; font-size: 28px;">New Quote Request</h1>
            <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0 0; font-size: 16px;">Booking Confirmation</p>
          </div>
          
          <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;">
            <!-- Customer Information -->
            <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px; font-size: 20px;">
                👤 Customer Information
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Name:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${firstName} ${lastName}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Email:</strong></td>
                  <td style="padding: 8px 0;"><a href="mailto:${email}" style="color: #667eea; text-decoration: none;">${email}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Phone:</strong></td>
                  <td style="padding: 8px 0;"><a href="tel:${phone}" style="color: #667eea; text-decoration: none;">${phone}</a></td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Customer Type:</strong></td>
                  <td style="padding: 8px 0; color: #333;">
                    <span style="background-color: #667eea; color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase;">
                      ${customerType}
                    </span>
                  </td>
                </tr>
              </table>
            </div>

            <!-- Device Information -->
            <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px; font-size: 20px;">
                📱 Device Information
              </h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Device Type:</strong></td>
                  <td style="padding: 8px 0; color: #333; text-transform: capitalize;">${deviceType}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Brand:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${brand.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Model:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${model.name}</td>
                </tr>
                <tr>
                  <td style="padding: 8px 0; color: #666;"><strong>Color:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${color.name}</td>
                </tr>
              </table>
            </div>

            <!-- Service Details -->
            <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px; font-size: 20px;">
                🔧 Service Details
              </h2>
              <table style="width: 100%; border-collapse: collapse; margin-bottom: 15px;">
                <tr>
                  <td style="padding: 8px 0; color: #666; width: 140px;"><strong>Service Method:</strong></td>
                  <td style="padding: 8px 0; color: #333;">${serviceMethodText}</td>
                </tr>
              </table>
              
              <p style="margin: 15px 0 10px 0; color: #666; font-weight: bold;">Selected Repairs:</p>
              <ul style="list-style: none; padding: 0; margin: 0;">
                ${repairsList}
              </ul>
            </div>

            ${
              notes
                ? `
            <div style="background-color: white; padding: 25px; border-radius: 8px; margin-bottom: 20px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-top: 0; border-bottom: 2px solid #667eea; padding-bottom: 10px; font-size: 20px;">
                📝 Additional Notes
              </h2>
              <p style="white-space: pre-wrap; color: #555; line-height: 1.6;">${notes}</p>
            </div>
            `
                : ""
            }

            <!-- Pricing Summary -->
            <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 25px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              ${
                pricing
                  ? `
              <div style="color: white; margin-bottom: 20px;">
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.3);">
                  <span style="color: rgba(255,255,255,0.9);">Subtotal:</span>
                  <span style="font-weight: bold;">$${pricing.subtotal.toFixed(2)}</span>
                </div>
                ${
                  pricing.discount > 0
                    ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.3);">
                  <span style="color: rgba(255,255,255,0.9);">Discount ${pricing.discountRuleName ? `(${pricing.discountRuleName})` : ""}:</span>
                  <span style="font-weight: bold; color: #4ade80;">-$${pricing.discount.toFixed(2)}</span>
                </div>
                `
                    : ""
                }
                ${
                  pricing.taxPercentage > 0
                    ? `
                <div style="display: flex; justify-content: space-between; margin-bottom: 10px; padding-bottom: 10px; border-bottom: 1px solid rgba(255,255,255,0.3);">
                  <span style="color: rgba(255,255,255,0.9);">Tax (${pricing.taxPercentage}%):</span>
                  <span style="font-weight: bold;">$${pricing.tax.toFixed(2)}</span>
                </div>
                `
                    : ""
                }
              </div>
              `
                  : ""
              }
              <div style="text-align: center;">
                <p style="color: rgba(255,255,255,0.9); margin: 0 0 10px 0; font-size: 16px; font-weight: bold;">TOTAL AMOUNT</p>
                <p style="color: white; margin: 0; font-size: 42px; font-weight: bold;">$${total.toFixed(
                  2
                )}</p>
                ${
                  pricing && pricing.taxPercentage > 0
                    ? `<p style="color: rgba(255,255,255,0.8); margin: 10px 0 0 0; font-size: 12px;">Including ${pricing.taxPercentage}% tax</p>`
                    : ""
                }
                ${
                  pricing && pricing.discount > 0
                    ? `<p style="color: #4ade80; margin: 5px 0 0 0; font-size: 14px; font-weight: bold;">Customer saved $${pricing.discount.toFixed(2)}!</p>`
                    : ""
                }
              </div>
            </div>

            <!-- Footer -->
            <div style="margin-top: 30px; padding-top: 20px; border-top: 2px solid #e0e0e0; text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                📧 This email was sent from your website's quote request form
              </p>
              <p style="color: #999; font-size: 12px; margin: 5px 0;">
                🕒 Submission time: ${new Date().toLocaleString()}
              </p>
              <p style="color: #667eea; font-size: 12px; margin: 15px 0 0 0; font-weight: bold;">
                Reply directly to this email to contact the customer
              </p>
            </div>
          </div>
        </div>
      `,
      text: `
New Quote Request - Booking Confirmation

═══════════════════════════════════════════
CUSTOMER INFORMATION
═══════════════════════════════════════════
Name: ${firstName} ${lastName}
Email: ${email}
Phone: ${phone}
Customer Type: ${customerType}

═══════════════════════════════════════════
DEVICE INFORMATION
═══════════════════════════════════════════
Device Type: ${deviceType}
Brand: ${brand.name}
Model: ${model.name}
Color: ${color.name}

═══════════════════════════════════════════
SERVICE DETAILS
═══════════════════════════════════════════
Service Method: ${serviceMethodText}

Selected Repairs:
${repairs
  .map((repair: any) => {
    const qualityLabel = repair.partQuality && repair.partQuality.name ? ` (${repair.partQuality.name})` : "";
    return `- ${repair.name}${qualityLabel} - $${repair.price} (${repair.duration})`;
  })
  .join("\n")}

${
  notes
    ? `\n═══════════════════════════════════════════\nADDITIONAL NOTES\n═══════════════════════════════════════════\n${notes}\n`
    : ""
}
═══════════════════════════════════════════
TOTAL AMOUNT: $${total.toFixed(2)}
═══════════════════════════════════════════
Including 0% tax

Submission time: ${new Date().toLocaleString()}
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json(
      { message: "Quote request sent successfully" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending quote email:", error);
    return NextResponse.json(
      { error: "Failed to send quote request. Please try again later." },
      { status: 500 }
    );
  }
}

# Contact Form Email Setup Guide

## Overview

The contact form now sends emails to your Hostinger webmail when users submit the form.

## Configuration Steps

### 1. Update Environment Variables

Open the `.env.local` file and update the following values:

```env
# Replace YOUR_EMAIL_PASSWORD with your actual Hostinger email password
HOSTINGER_PASSWORD=YOUR_ACTUAL_PASSWORD_HERE
```

**Important:** Make sure to replace `YOUR_EMAIL_PASSWORD` with the actual password for `info@myhai.in`

### 2. Hostinger Email Settings

The contact form is configured to use:

- **SMTP Host:** smtp.hostinger.com
- **Port:** 465 (SSL)
- **Email:** info@myhai.in
- **Recipient:** info@myhai.in (emails will be sent to this address)

### 3. Test the Form

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the contact page: `http://localhost:3000/contact-us`

3. Fill out the form with test data

4. Click "Send Message & Get Free Quote"

5. Check your `info@myhai.in` inbox for the email

### 4. Email Format

When a user submits the form, you'll receive an email with:

**Subject:** New Contact Form Submission - [Device Model] Repair

**Content:**

- Customer Name
- Customer Email (set as Reply-To for easy responses)
- Customer Phone
- Device Model
- Issue Type
- Additional Details (if provided)
- Submission timestamp

## Features

✅ **Professional Email Template:** HTML-formatted emails with customer information
✅ **Reply-To:** Customer's email is set as reply-to for easy responses
✅ **Form Validation:** Required fields are validated before submission
✅ **Loading State:** Button shows "Sending..." during submission
✅ **Success/Error Notifications:** Toast messages inform users of submission status
✅ **Auto-Reset:** Form clears after successful submission

## Troubleshooting

### Email Not Sending

1. **Check Hostinger Email Password:**

   - Verify the password in `.env.local` is correct
   - Try logging into Hostinger webmail to confirm credentials

2. **Check SMTP Settings:**

   - Hostinger typically uses `smtp.hostinger.com` on port 465
   - If this doesn't work, check your Hostinger control panel for SMTP settings

3. **Check Server Logs:**

   - Look at the terminal/console for error messages when submitting the form

4. **Firewall/Antivirus:**
   - Ensure your firewall isn't blocking port 465

### Common Hostinger SMTP Settings

If port 465 doesn't work, try these alternatives:

**Option 1: Port 587 (TLS)**
Update the API route to use:

```typescript
port: 587,
secure: false,
```

**Option 2: Alternative SMTP Server**
Some Hostinger accounts use domain-specific SMTP:

```typescript
host: "smtp.yourdomain.com",
```

## Security Notes

⚠️ **Never commit `.env.local` to version control**

- The file is already in `.gitignore`
- Keep your email password secure

⚠️ **Production Deployment**

- When deploying (Vercel, Netlify, etc.), add environment variables in the hosting platform's dashboard
- Don't hardcode sensitive credentials in your code

## Need Help?

1. Check Hostinger documentation for SMTP settings
2. Test email credentials by logging into webmail
3. Review server console logs for error details
4. Contact Hostinger support if SMTP issues persist

## Alternative: Using Hostinger Email API

If SMTP doesn't work, you can also use Hostinger's email API if they provide one, or consider using third-party email services like:

- SendGrid
- Mailgun
- Resend
- Amazon SES

These services often have better deliverability and more generous free tiers for transactional emails.

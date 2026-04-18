const nodemailer = require('nodemailer');

// Create Gmail transporter
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_APP_PASSWORD,
  },
});

// Verify transporter on startup
transporter.verify((error) => {
  if (error) {
    console.error('❌ Email service error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

// Generate 6-digit OTP code
const generateVerificationCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// Send verification email
const sendVerificationEmail = async (email, name, code) => {
  const mailOptions = {
    from: `"NaijaGIG" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Verify Your NaijaGIG Account',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: Arial, sans-serif;">
          <div style="max-width: 600px; margin: 40px auto; background-color: #1A2E1A; border-radius: 16px; overflow: hidden;">
            
            <!-- Header -->
            <div style="background-color: #243324; padding: 30px; text-align: center;">
              <h1 style="color: #C4F547; margin: 0; font-size: 28px;">NaijaGIG</h1>
              <p style="color: #9CA3AF; margin: 8px 0 0 0; font-size: 14px;">Nigeria's #1 Artisan Marketplace</p>
            </div>

            <!-- Body -->
            <div style="padding: 40px 30px;">
              <h2 style="color: #FFFFFF; margin: 0 0 16px 0;">Hi ${name}! 👋</h2>
              <p style="color: #D1D5DB; font-size: 16px; line-height: 1.6; margin: 0 0 30px 0;">
                Welcome to NaijaGIG! Please verify your email address using the code below.
              </p>

              <!-- OTP Code -->
              <div style="background-color: #2D4A2D; border: 2px solid #C4F547; border-radius: 12px; padding: 30px; text-align: center; margin: 0 0 30px 0;">
                <p style="color: #9CA3AF; margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 2px;">Your Verification Code</p>
                <h1 style="color: #C4F547; margin: 0; font-size: 48px; letter-spacing: 12px; font-weight: bold;">${code}</h1>
              </div>

              <p style="color: #9CA3AF; font-size: 14px; text-align: center; margin: 0 0 30px 0;">
                ⏰ This code expires in <strong style="color: #F59E0B;">15 minutes</strong>
              </p>

              <p style="color: #6B7280; font-size: 13px; text-align: center; margin: 0;">
                If you didn't create an NaijaGIG account, please ignore this email.
              </p>
            </div>

            <!-- Footer -->
            <div style="background-color: #243324; padding: 20px; text-align: center;">
              <p style="color: #6B7280; margin: 0; font-size: 12px;">
                © 2024 NaijaGIG. All rights reserved.
              </p>
            </div>

          </div>
        </body>
      </html>
    `,
  };

  await transporter.sendMail(mailOptions);
  console.log(`✅ Verification email sent to ${email}`);
};

// Send booking notification email
const sendBookingNotificationEmail = async (email, name, message) => {
  const mailOptions = {
    from: `"NaijaGIG" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'NaijaGIG - Booking Update',
    html: `
      <div style="max-width: 600px; margin: 40px auto; background-color: #1A2E1A; border-radius: 16px; overflow: hidden; font-family: Arial, sans-serif;">
        <div style="background-color: #243324; padding: 30px; text-align: center;">
          <h1 style="color: #C4F547; margin: 0;">NaijaGIG</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #FFFFFF;">Hi ${name}!</h2>
          <p style="color: #D1D5DB; font-size: 16px; line-height: 1.6;">${message}</p>
        </div>
        <div style="background-color: #243324; padding: 20px; text-align: center;">
          <p style="color: #6B7280; margin: 0; font-size: 12px;">© 2024 NaijaGIG</p>
        </div>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = {
  generateVerificationCode,
  sendVerificationEmail,
  sendBookingNotificationEmail,
};
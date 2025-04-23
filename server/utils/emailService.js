import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Create a nodemailer transporter
 */
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
    // Required for Gmail
    tls: {
      rejectUnauthorized: false
    }
  });
};

/**
 * Send an email
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.text - Plain text content
 * @param {string} options.html - HTML content
 * @returns {Promise} - Nodemailer send result
 */
export const sendEmail = async (options) => {
  try {
    const transporter = createTransporter();

    const mailOptions = {
      from: `"${process.env.EMAIL_FROM_NAME}" <${process.env.EMAIL_FROM}>`,
      to: options.to,
      subject: options.subject,
      text: options.text || '',
      html: options.html || '',
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: %s', info.messageId);

    // For development with Ethereal, log the preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    }

    return info;
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error(`Failed to send email: ${error.message}`);
  }
};

/**
 * Send a password reset email
 * @param {string} to - Recipient email
 * @param {string} resetToken - Password reset token
 * @param {string} name - Recipient name
 * @returns {Promise} - Email send result
 */
export const sendPasswordResetEmail = async (to, resetToken, name) => {
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

  const subject = 'Password Reset Request';

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #4a5568; text-align: center; padding-bottom: 10px; border-bottom: 1px solid #e2e8f0;">
        Password Reset Request
      </h2>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
        Hello ${name || 'there'},
      </p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
        You are receiving this email because you (or someone else) has requested to reset your password.
      </p>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
        Please click the button below to reset your password. This link will expire in ${process.env.PASSWORD_RESET_EXPIRE || 60} minutes.
      </p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${resetUrl}" style="background-color: #48bb78; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">
          Reset Password
        </a>
      </div>
      <p style="color: #4a5568; font-size: 16px; line-height: 1.5;">
        If you did not request this, please ignore this email and your password will remain unchanged.
      </p>
      <div style="padding-top: 20px; border-top: 1px solid #e2e8f0; margin-top: 30px; text-align: center; color: #a0aec0; font-size: 14px;">
        <p>FreshMart - Your one-stop shop for fresh groceries</p>
      </div>
    </div>
  `;

  const text = `
    Hello ${name || 'there'},

    You are receiving this email because you (or someone else) has requested to reset your password.

    Please click the link below to reset your password. This link will expire in ${process.env.PASSWORD_RESET_EXPIRE || 60} minutes.

    ${resetUrl}

    If you did not request this, please ignore this email and your password will remain unchanged.

    FreshMart - Your one-stop shop for fresh groceries
  `;

  // Always log the reset URL to the console for debugging
  console.log('\n==================================');
  console.log('PASSWORD RESET LINK:');
  console.log(resetUrl);
  console.log('==================================\n');

  // Always send the actual email
  return sendEmail({
    to,
    subject,
    text,
    html,
  });
};

export default {
  sendEmail,
  sendPasswordResetEmail,
};

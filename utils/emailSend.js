/* eslint-disable no-undef */
import fs from 'fs';
import nodemailer from 'nodemailer';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   secure: false,
//   auth: {
//     user: process.env.EMAIL_USER,
//     pass: process.env.EMAIL_PASS,
//   },
// });

const transporter = nodemailer.createTransport({
  host: 'smtp.hostinger.com', // Hostinger SMTP server
  port: 465,                  // SSL port (use 587 for TLS)
  secure: true,               // true for SSL, false for TLS
  auth: {
    user: process.env.EMAIL_USER, // your Hostinger email, e.g., support@yourdomain.com
    pass: process.env.EMAIL_PASS  // your Hostinger email password
  },
});

// send followup email
export const sendFollowupEmail = async (username, email, subject, message, attachment, destinationUrl) => {
  const templatePath = path.join(
    __dirname,
    '../emailTemplate/followupTemplate.html'
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  // Replace placeholders in the template
  // htmlContent = htmlContent.replace('{{subject}}', subject);
  // htmlContent = htmlContent.replace('{{message}}', message);

  // Handle attachment display in the email body
  let attachmentHtml = '';
  let destinationUrlHtml = '';
  if (attachment) {
    const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachment);

    if (isImage) {
      attachmentHtml = `
        <div style="margin-top: 20px;">
          <img src="${attachment}" alt="Attachment" style="max-width: 100%; height: auto;">
        </div>
      `;
    } else {
      attachmentHtml = attachment;
    }
  }
  if (destinationUrl) {
    destinationUrlHtml = `
    <div style="margin-top: 20px;">
      <p><a href="${destinationUrl}" target="_blank">Visit here</a></p>
    </div>
  `;
  }
  htmlContent = htmlContent.replace('{{attachment}}', attachmentHtml);
  htmlContent = htmlContent.replace('{{destinationUrl}}', destinationUrlHtml);

  // Configure email options
  const mailOptions = {
    from: `${username} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: subject,
    html: htmlContent,
  };

  // Add actual attachments if needed (not just links)
  // if (attachment && !attachment.startsWith('http')) {
  //   // Assuming local file path if not a URL
  //   mailOptions.attachments = [{
  //     filename: path.basename(attachment),
  //     path: attachment
  //   }];
  // }

  await transporter.sendMail(mailOptions);
};

// export const sendFollowupEmail = async (username, email, subject, message, attachment, destinationUrl) => {
//   const templatePath = path.join(
//     __dirname,
//     '../emailTemplate/followupTemplate.html'
//   );
//   let htmlContent = fs.readFileSync(templatePath, 'utf8');

//   htmlContent = htmlContent.replace('{{subject}}', subject);
//   htmlContent = htmlContent.replace('{{message}}', message);
//   htmlContent = htmlContent.replace('{{attachment}}', attachment);
//   htmlContent = htmlContent.replace('{{destinationUrl}}', destinationUrl);
//   const mailOptions = {
//     from: `${username} <${process.env.EMAIL_USER}>`,
//     to: email,
//     subject: subject,
//     html: htmlContent,
//   };

//   await transporter.sendMail(mailOptions);
// };

// send verification email
export const sendVerificationEmail = async (email, token) => {
  const templatePath = path.join(
    __dirname,
    '../emailTemplate/registrationTemplate.html'
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  htmlContent = htmlContent.replace('{{token}}', token);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Verify your email',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// send admin user create email
export const sendAdminUserCreateEmail = async (
  email,
  verificationToken,
  password
) => {

  const templatePath = path.join(
    __dirname,
    '../emailTemplate/adminUserCreateTemplate.html'
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

  htmlContent = htmlContent.replace('{{verificationUrl}}', verificationUrl);
  htmlContent = htmlContent.replace('{{password}}', password);

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Welcome to Our Platform - Verify Your Email',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// send password reset email
export const sendPasswordResetEmail = async (email, resetUrl, username) => {

  const templatePath = path.join(
    __dirname,
    '../emailTemplate/passwordResetTemplate.html'
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  htmlContent = htmlContent.replace('{{resetUrl}}', resetUrl);

  const mailOptions = {
    from: `${username} <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Password Reset Request',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};

// send password reset confirmation email
export const sendPasswordResetConfirmationEmail = async (email) => {
  const templatePath = path.join(
    __dirname,
    '../emailTemplate/passwordResetConfirmationTemplate.html'
  );
  let htmlContent = fs.readFileSync(templatePath, 'utf8');

  const mailOptions = {
    from: process.env.EMAIL,
    to: email,
    subject: 'Password Reset Successful',
    html: htmlContent,
  };

  await transporter.sendMail(mailOptions);
};



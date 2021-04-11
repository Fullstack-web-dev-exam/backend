const nodemailer = require('nodemailer');

require('dotenv').config();

exports.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.getPasswordResetUrl = (user, token) =>
  `http://localhost:5000/forgotpassword/reset/${user._id}/${token}`;

exports.resetPasswordTemplate = (user, url) => {
  const from = process.env.EMAIL_LOGIN;
  const to = user.email;
  const subject = 'Noreply Simple reset password';
  const html = `
  <p>Hey ${user.name || user.email},</p>
  <p>This is a noreply email where you can reset password</p>
  <a href=${url}>${url}</a>
  <p>URL will expire in one hour</p>
  `;
  return {from, to, subject, html};
};

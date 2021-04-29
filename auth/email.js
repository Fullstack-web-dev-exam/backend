const nodemailer = require('nodemailer');

require('dotenv').config();

exports.transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_LOGIN,
    pass: process.env.EMAIL_PASSWORD,
  },
});

if (
  process.env &&
  process.env.NODE_ENV &&
  process.env.NODE_ENV === 'production'
) {
  exports.getPasswordResetUrl = (user, token) =>
    `https://fullstackwebproject.herokuapp.com/reset_password/reset/${user._id}/${token}`;
} else {
  exports.getPasswordResetUrl = (user, token) =>
    `http://localhost:5000/reset_password/reset/${user._id}/${token}`;
}

exports.resetPasswordTemplate = (user, url) => {
  const from = process.env.EMAIL_LOGIN;
  const to = user.email;
  const subject = 'Noreply Simple reset password';
  const html = `
  <p>Hey ${user.name || user.email},</p>
  <p>This is a noreply email where you can reset password</p>
  <p>URL will expire in one hour</p>
  <a href=${url}>${url}</a>
  <p>Best regards,</p>
  <p>Fullstack project team</p>
  `;
  return {from, to, subject, html};
};

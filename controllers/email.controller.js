const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const {
  transporter,
  getPasswordResetUrl,
  resetPasswordTemplate,
} = require('../auth/email');
const UserModel = require('../models/User');

// Helper function for sending email
const UsePasswordHashToMakeToken = (password, userId, createdAt) => {
  const secret = `${password}-${createdAt}`;
  const token = jwt.sign({userId}, secret, {
    expiresIn: 3600, // 1 hour
  });

  return token;
};

exports.sendPasswordResetEmail = async (req, res) => {
  const email = req.body.userEmail;

  // Checks if user with email is in db
  const user = await UserModel.findOne({email}).exec();
  if (!user) return res.status(404).json({message: 'No user with that email'});
  // Uses helper function to create token using password and createdAt with 1 hour expiration date
  const token = UsePasswordHashToMakeToken(
    user.passwordHash,
    user._id,
    user.createdAt
  );

  const url = getPasswordResetUrl(user, token); // `http://localhost:5000/reset_password/reset/${user._id}/${token}`
  // Uses predefined email template
  const emailTemplate = resetPasswordTemplate(user, url);

  //  Sends email using template
  try {
    const info = await transporter.sendMail(emailTemplate);
    res.status(200).json({message: 'Email sent'});
    console.log(`** Email Sent **`, info.response);
  } catch (error) {
    res.status(500).json({message: 'Error sending mail', error});
  }
};

exports.recieveNewPassword = async (req, res) => {
  const {userId, token} = req.params;
  const {password} = req.body;

  // Finds user based on userID from params
  const user = await UserModel.findOne({_id: userId});
  if (!user) return res.status(404).json({message: 'invalid user'});

  // defines what the secret is and decodes to validate
  // Validates userID from url and database
  const secret = `${user.password}-${user.createdAt}`;
  const payload = jwt.decode(token, secret);
  if (payload.userId !== user.id) {
    return res.status(404).json({error: 'invalid user'});
  }

  // Hashes new password and updates the user in db using userID
  try {
    const hash = bcrypt.hashSync(password, 10);

    await UserModel.findOneAndUpdate({_id: userId}, {password: hash});

    return res.status(202).json({message: 'Password changed accepted'});
  } catch (error) {
    res.status(500).send({message: 'Error reciveing new password', error});
  }
};

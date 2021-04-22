const bcrypt = require('bcrypt');

const jwt = require('jsonwebtoken');
const {
  transporter,
  getPasswordResetUrl,
  resetPasswordTemplate,
} = require('../auth/email');
const UserModel = require('../models/User');

const UsePasswordHashToMakeToken = ({
  password: passwordHash,
  _id: userId,
  createdAt,
}) => {
  const secret = `${passwordHash}-${createdAt}`;
  const token = jwt.sign({userId}, secret, {
    expiresIn: 3600, // 1 hour
  });

  return token;
};

exports.sendPasswordResetEmail = async (req, res) => {
  const email = req.body.userEmail;
  let user;
  try {
    user = await UserModel.findOne({email}).exec();
  } catch (error) {
    res.status(404).json({error: 'No user with that email'});
  }
  const token = UsePasswordHashToMakeToken(user);
  const url = getPasswordResetUrl(user, token);
  const emailTemplate = resetPasswordTemplate(user, url);

  const sendEmail = () => {
    transporter.sendMail(emailTemplate, (err, info) => {
      if (err) return res.status(500).json({error: 'Error sending mail'});
      res.send({message: 'Email sent'});
      console.log(`** Email Sent **`, info.response);
    });
  };
  sendEmail();
};

exports.recieveNewPassword = async (req, res) => {
  try {
    const {userId, token} = req.params;
    const {password} = req.body;

    await UserModel.findOne({_id: userId})
      .then(user => {
        const secret = `${user.password}-${user.createdAt}`;
        const payload = jwt.decode(token, secret);
        if (payload.userId === user.id) {
          bcrypt.genSalt(10, function (err, salt) {
            if (err) return;
            bcrypt.hash(password, salt, function (err, hash) {
              if (err) return;
              UserModel.findOneAndUpdate({_id: userId}, {password: hash}).then(
                () => {
                  res.status(202).json({message: 'Password changed accepted'});
                }
              );
            });
          });
        }
      })
      .catch(() => {
        res.status(404).json({error: 'invalid user'});
      });
  } catch (error) {
    throw new Error(error);
  }
};

const JWT = require('jsonwebtoken');
const Joi = require('joi');
const crypto = require('crypto');
const UserModel = require('../model/user.model');
const RefreshTokenModel = require('../model/refresh-token.model');
require('dotenv').config();

exports.generateJwt = user =>
  JWT.sign(
    {
      auth: true,
      email: user.email,
      role: user.role,
      sub: user.id,
    },
    process.env.TOKEN_SECRET,
    {expiresIn: '15m'} // Expires in 15 min
  );

exports.setTokenCookie = (res, token) => {
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  };
  res.cookie('refreshToken', token, cookieOptions);
};

// User methods
// exports.signIn = async function (req, res, next) {
//   const {email} = req.body;
//   const ipAddress = req.ip;
//   authenticate({email, ipAddress})
//     .then(({refreshToken, ...user}) => {
//       setTokenCookie(res, refreshToken);
//       res.json(user);
//     })
//     .catch(next);
// };

// const authenticate = async ({email, password, ipAddress}) => {
//   // Generate token
//   const user = await UserModel.findOne({email});
// 
//   const jwtToken = generateJwt(user);
//   const refreshToken = generateRefreshToken(user, ipAddress);
//   // console.log(refreshToken)
//   await refreshToken.save();
//   console.log(jwtToken);
//   console.log(refreshToken);
//   return {
//     user,
//     jwtToken,
//     refreshToken: refreshToken.token,
//   };
// };

// Token methods
exports.randomTokenString = () => crypto.randomBytes(40).toString('hex');

// exports.refreshJwtToken = async ({token, ipAddress}) => {
//   const refreshToken = await this.getRefreshToken(token);
//   const {user} = refreshToken;
// 
//   // Replace old refresh token with new one and save
//   const newRefreshToken = this.generateRefreshToken(user, ipAddress);
//   refreshToken.revoked = Date.now();
//   refreshToken.revokedByIp = ipAddress;
//   refreshToken.replacedByToken = newRefreshToken.token;
//   await refreshToken.save();
//   await newRefreshToken.save();
// 
//   // Generate new JWT
//   const jwtToken = generateJwt(user);
// 
//   const {name, surname, email} = user;
//   return {
//     name,
//     surname,
//     email,
//     jwtToken,
//     refreshToken: newRefreshToken.token,
//   };
// };

exports.generateRefreshToken = (user, ipAddress) =>
  // Create refresh token that expires in 7 days
  new RefreshTokenModel({
    user: user._id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress,
  });

exports.getRefreshToken = async token => {
  const refreshToken = await RefreshTokenModel.findOne({token}).populate(
    'user'
  );
  if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
  return refreshToken;
};

exports.getRefreshTokens = async userEmail => {
  // Check if user exists
  await UserModel.findOne({email: userEmail});

  // return refresh tokens for user
  const refreshTokens = await RefreshTokenModel.find({user: currentUser});
  return refreshTokens;
};

exports.revokeToken = async ({token, ipAddress}) => {
  const refreshToken = await getRefreshToken(token);

  // revoke token and save
  refreshToken.revoked = Date.now();
  refreshToken.revokedByIp = ipAddress;
  await refreshToken.save();
};


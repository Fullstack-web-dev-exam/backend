const JWT = require('jsonwebtoken');
require('dotenv').config();

const signToken = user =>
  JWT.sign(
    {
      auth: true,
      email: user.email,
      role: user.role,
      sub: user.id,
      expires: 1,
      // exp: new Date().setDate(new Date().getDate() + 1), // Current time + 1 day,
      // exp: new Date().getMinutes() + 1, // 1 minute
    },
    process.env.TOKEN_SECRET
  );

// exports.signIn = async function (req, res, next) {
//     const token = signToken(req.user);
// 		return res.json({token})
//     // return res.status(200).send({token});
// };

exports.signIn = async function (req, res, next) {
  // Generate token
  const token = signToken(req.user);
  // res.cookie('token', req.user.role);
  res.cookie('access_token', token, {
    httpOnly: true,
  });
  res.status(200).json({token});
};

const jwt = require('express-jwt');
const UserModel = require('../model/user.model');
const RefreshTokenModel = require('../model/refresh-token.model');
require('dotenv').config();

const secret = process.env.TOKEN_SECRET;
module.exports = authorize;
function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    jwt({secret, algorithms: ['HS256']}),
    async (req, res, next) => {
      console.log('hey');
      // const currentUser = req.user.email;
      const user = await UserModel.findById(req.user.id);
			console.log('hey')
      // if (!user || (roles.length && !roles.includes(user.role))) {
      //   return res.status(401).json({message: 'Unauthorized'});
      // }

      req.user.role = user.role;

      const refreshTokens = await RefreshTokenModel.find({user: user._id});
      req.user.ownsToken = token =>
        !!refreshTokens.find(x => x.token === token);
			next()
    },
  ];
}

const jwt = require('express-jwt');
const secret = process.env.TOKEN_SECRET;
const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

module.exports = authorize;

function authorize(roles = []) {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return [
    jwt({secret, algorithms: ['HS256']}),

    async (req, res, next) => {
      const user = await User.findById(req.user.id);
      const refreshToken = await RefreshToken.find({user: user.id});

      if (!user || (roles.length && !roles.includes(user.role))) {
        return res.status(401).json({message: 'Unauthorized'});
      }

      req.user.role = user.role;
      req.user.ownsToken = token => !!refreshToken.find(x => x.token === token);
      next();
    },
  ];
}

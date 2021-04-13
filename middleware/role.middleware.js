// Currently not used
const jwtDecode = require('jwt-decode');

module.exports.Gardener = (req, res, next) => {
  if (req.user && req.user.role === 'gardener') {
    next();
  } else {
    next({message: 'You are not a Gardener'});
  }
};

module.exports.Manager = (req, res, next) => {
  const token = req.cookies.access_token;
  const decoded = jwtDecode(token);
  if (decoded.role === 'manager') {
    next();
  } else {
    next({message: 'You are not a Manager'});
  }
};

module.exports.User = (req, res, next) => {
  const token = req.cookies.access_token;
  const decoded = jwtDecode(token);
  if (!decoded.role) {
    next({message: 'You are not an user'});
  } else {
    next();
  }
};

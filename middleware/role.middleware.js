// Currently not used
module.exports.Gardener = (req, res, next) => {
  if (req.user && req.user.role === 'gardener') {
    next();
  } else {
    next({message: 'You are not a Gardener'});
  }
};

module.exports.Manager = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    next({message: 'You are not a Manager'});
  }
};

module.exports.User = (req, res, next) => {
  if (!req.user) {
    next({message: 'You are not an user'});
  } else {
    next();
  }
};

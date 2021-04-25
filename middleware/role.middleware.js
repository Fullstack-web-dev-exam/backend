module.exports.Manager = (req, res, next) => {
  if (req.user && req.user.role === 'manager') {
    next();
  } else {
    next({error: 'You are not a Manager'});
  }
};

module.exports.User = (req, res, next) => {
  if (!req.user) {
    next({error: 'You are not an user'});
  } else {
    next();
  }
};

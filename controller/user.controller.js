const UserModel = require('../model/user.model');

// Get user information based on role
// Gardeners and Managers can get their on information (not password and id)
exports.getUser = function (req, res, next) {
  try {
    const currentUser = req.user.email;
    if (req.user.role === 'manager' || req.user.role === 'gardener') {
      // Query for user with email and filter out information to display
      const queryUser = UserModel.findOne({email: currentUser}, [
        'name',
        'surname',
        'role',
        'email',
        '-_id',
      ]);
      queryUser.exec(function (err, value) {
        if (err) return next(err);
        res.send({value});
      });
    } else {
      res.status(400).send({message: 'error'});
    }
  } catch (error) {
    next(error);
  }
};

// Managers can only create new user
// Garderns === Unauthorized

exports.createUser = async function (req, res, next) {
  try {
    if (req.user.role === 'manager') {
      const {name, surname, role, email, password} = req.body;
      // validate field
      if (!name || !surname || !role || !email || !password) {
        res.status(400).send({
          message: 'name, surname, role, email and password is required',
        });
      }

      const user = new UserModel({
        name: req.body.name,
        surname: req.body.surname,
        role: req.body.role,
        email: req.body.email,
        password: req.body.password,
      });

      await UserModel.exists({user}).then(data => {
        if (data) {
          res.status(400).send({message: 'User already exists'});
        } else {
          user
            .save(user)
            .then(resData => {
              res.send(resData);
            })
            .catch(err => {
              res.status(500).send({
                message: err.message || 'Some error occured while saving user',
              });
            });
        }
      });
    } else {
      res.send({message: 'Unauthorized'});
    }
  } catch (error) {
    next(error);
  }
};

// Manager can only delete users
// Gardenrs === Unauthorized

exports.deleteUser = function (req, res, next) {
  try {
    const {email} = req.params;
    if (req.user.role === 'manager') {
      UserModel.findOneAndDelete(email).then(data => {
        if (!data) {
          return res
            .status(400)
            .send({message: `User with email=${email} was not found`});
        }
        res
          .status(200)
          .send({message: `User with email=${email} was deleted successfully`});
      });
    }
  } catch (error) {
    next(error);
  }
};

// Manager can only get all users information (not id, password)
// Gardeners === Unauthorized

exports.getAllUsers = function (req, res, next) {
  try {
    const queryAll = UserModel.find({}, [
      'name',
      'surname',
      'email',
      'role',
      '-_id',
    ]);

    queryAll.exec(function (error, value) {
      if (error) return next({message: 'Error queryAll users'}, error);
      res.send(value);
    });
  } catch (error) {
    next({message: 'Not sure why?'}, error);
  }
};

// Manager can update user information (not id, password)
// Gardeners can update user information (not id, email, password)

exports.updateUser = (req, res, next) => {
  const {email} = req.body;
  const {password} = req.body;
  try {
    if (req.user.role === 'manager') {
      // update a user by its email
      if (!req.body)
        return res
          .status(400)
          .send({message: 'Data to update cannot be empty!'});

      if (password)
        return res.status(400).send({message: 'Cannot update password'});

      // Update user based on email
      UserModel.findOneAndUpdate(email, req.body, {
        useFindAndModify: false,
      }).then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update user with email=${email}. Maybe the user was not found`,
          });
        }
      });
    } else if (req.user.role === 'gardener') {
      if (password || email)
        return res
          .status(400)
          .send({message: 'Cannot update password or email'});

      // Update user based on email
      UserModel.findOneAndUpdate(email, req.body, {
        useFindAndModify: false,
      }).then(data => {
        if (!data) {
          res.status(404).send({
            message: `Cannot update user with email=${email}. Maybe the user was not found`,
          });
        }
      });
    }
  } catch (error) {
    next(error);
  }
};
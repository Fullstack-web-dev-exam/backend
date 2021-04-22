const UserModel = require('../models/User');
const bcrypt = require('bcrypt');

// Managers can only create new user
// Gardener === Unauthorized
exports.createUser = async function (req, res, next) {
  try {
    const {name, surname, role, email, password} = req.body;
    // validate field
    if (!name || !surname || !role || !email || !password) {
      return res.status(400).json({
        error: 'name, surname, role, email and password is required',
      });
    }

    const passwordHash = bcrypt.hashSync(req.body.password, 10);

    const user = new UserModel({
      name: req.body.name,
      surname: req.body.surname,
      role: req.body.role,
      email: req.body.email,
      password: passwordHash,
    });

    await UserModel.exists({email: user.email}).then(data => {
      if (data) {
        res.status(400).json({error: 'User already exists'});
      } else {
        user
          .save(user)
          .then(resData => {
            console.log(resData);
            const response = {
              name: resData.name,
              surname: resData.surname,
              role: resData.role,
              email: resData.email,
            };
            res.status(200).send(response);
          })
          .catch(err => {
            res.status(500).json({
              error: err.message || 'Some error occurred while saving user',
            });
          });
      }
    });
  } catch (error) {
    next(error);
  }
};

// Manager can only delete users
// Gardener === Unauthorized
exports.deleteUser = function (req, res, next) {
  try {
    const currentUser = req.body.email;
    UserModel.findOneAndDelete({email: currentUser}).then(data => {
      if (!data) {
        return res
          .status(400)
          .send({error: `User with email=${currentUser} was not found`});
      }
      res.status(200).send({
        message: `User with email=${currentUser} was deleted successfully`,
      });
    });
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
      if (error) return res.status(400).json({error: 'Error querying users'});
      res.status(200).send(value);
    });
  } catch (error) {
    res.status(500).json({error: 'Could not get all users'}, error);
  }
};

// Manager can update user information (not id, password)
// Gardeners can update user information (not id, email, password)
exports.updateUser = async (req, res, next) => {
  const userEmail = req.body.selectedUser;
  const {password} = req.body;
  const currentUser = req.user.email;
  try {
    // update a user by its email
    if (!req.body)
      return res.status(400).send({error: 'Data to update cannot be empty!'});

    if (password)
      return res.status(400).send({error: 'Cannot update password'});

    // Update user based on email
    await UserModel.findOneAndUpdate({email: userEmail}, req.body, {
      useFindAndModify: false,
    }).then(data => {
      if (!data) {
        res.status(404).send({
          error: `Cannot update user with email=${userEmail}. Maybe the user was not found`,
        });
      } else {
        res.status(200).send({data});
      }
    });

    if (req.body.email)
      return res.status(400).send({error: 'Cannot update password or email'});

    // Update user based on email
    await UserModel.findOneAndUpdate({email: currentUser}, req.body, {
      useFindAndModify: false,
    }).then(data => {
      if (!data) {
        res.status(404).send({
          error: `Cannot update user with email=${currentUser}. Maybe the user was not found`,
        });
      } else {
        res.status(200).send({data});
      }
    });
  } catch (error) {
    next(error);
  }
};

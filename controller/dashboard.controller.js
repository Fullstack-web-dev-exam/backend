const UserModel = require('../model/user.model');
// Create user, GetAllUsers, edit user, delete user
// Manager can only get all users information (not id, password)
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

// Managers can only create new user
exports.createUser = async function (req, res, next) {
  try {
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
  } catch (error) {
    next(error);
  }
};

// Manager can only delete users
exports.deleteUser = function (req, res, next) {
  try {
    const {email} = req.params;
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
  } catch (error) {
    next(error);
  }
};



// Manager can update user information (not id, password)

exports.updateUser = async (req, res, next) => {
  try {
    if (!req.body)
      return res.status(400).send({message: 'Data to update cannot be empty!'});

    const currentUser = req.user.email;

    // Update user based on email
    await UserModel.findOneAndUpdate({email: currentUser}, req.body, {
      useFindAndModify: false,
    }).then(data => {
      // console.log(data)
      if (!data) {
        res.status(404).send({
          message: `Cannot update user with email=${currentUser}. Maybe the user was not found`,
        });
      } else {
        const {name, surname} = data;
        res.status(200).send({name, surname});
      }
    });
  } catch (error) {
    next(error);
  }
};

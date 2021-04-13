const UserModel = require('../model/user.model');
const jwtDecode = require('jwt-decode');

// Garderners can get their own information (not password and id)
exports.getUser = function (req, res, next) {
  try {
  const token = req.cookies.access_token;
  const decoded = jwtDecode(token);
    const currentUser = decoded.email;
	console.log(req)
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
  } catch (error) {
    next(error, {message: 'Something wrong happened when getting user'});
  }
};


// Gardeners can update user information (not id, email, password)

exports.updateUser = async (req, res, next) => {
  try {
      const currentUserEmail = req.user.email;

      if (req.body.email === currentUserEmail)
            return res
              .status(400)
              .send({message: 'Cannot update email'});

		const {name, surname} = req.body

      // Update user based on email
      await UserModel.findOneAndUpdate({email: currentUserEmail}, {name, surname}, {
        useFindAndModify: false,
      }).then(data => {
				console.log(data)
        if (!data) {
          res.status(404).send({
            message: `Cannot update user with email=${currentUserEmail}. Maybe the user was not found`,
          });
        } else {
          res.status(200).send({data});
        }
      });
  } catch (error) {
    next(error);
  }
};

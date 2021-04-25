const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getUser = (req, res) => {
  // Return user information from request
  try {
    const user = req.user;
    res.status(200).json({
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({error: 'Could not get user', error});
  }
};

exports.updateUser = async (req, res) => {
  const user = req.user;
  const newUserDetails = req.body;
  const updates = {};

  // check if body is empty
  if (
    !newUserDetails.name &&
    !newUserDetails.surname &&
    !newUserDetails.password &&
    !newUserDetails.oldPassword
  ) {
    return res.status(400).json({error: 'name, surname or password and oldPassword is needed'});
  }

  if (newUserDetails.name) {
    updates.name = newUserDetails.name;
  }

  if (newUserDetails.surname) {
    updates.surname = newUserDetails.surname;
  }
  // compares old password with user password
  if (newUserDetails.oldPassword && newUserDetails.password) {
    if (!bcrypt.compareSync(newUserDetails.oldPassword, user.password)) {
      return res.status(400).json({error: 'Incorrect password provided'});
    }
    const password = bcrypt.hashSync(newUserDetails.password, 10);
    updates.password = password;
  }

  // Update user with new details
  try {
    await User.updateOne({_id: user._id}, {$set: updates});
    return res.status(200).json({message: 'User updated successfully'});
  } catch (error) {
    res.status(500).json({error: 'Could not update user', error});
  }
};

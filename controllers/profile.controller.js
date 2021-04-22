const bcrypt = require('bcryptjs');
const User = require('../models/User');

exports.getUser = (req, res) => {
  try {
    const user = req.user;
    res.status(200).json({
      name: user.name,
      surname: user.surname,
      email: user.email,
      role: user.role,
    });
  } catch (error) {
    res.status(500).json({message: 'Could not get user', error});
  }
};

exports.updateUser = async (req, res) => {
  try {
    const user = req.user;
    const newUserDetails = req.body;
    const updates = {};

    if (
      !newUserDetails.name &&
      !newUserDetails.surname &&
      !newUserDetails.password &&
      !newUserDetails.oldPassword
    ) {
      return res
        .status(400)
        .json({
          message: 'You must specify what fields to update. Cannot be empty.',
        });
    }

    if (newUserDetails.name) {
      updates.name = newUserDetails.name;
    }

    if (newUserDetails.surname) {
      updates.surname = newUserDetails.surname;
    }

    if (newUserDetails.oldPassword && newUserDetails.password) {
      if (!bcrypt.compareSync(newUserDetails.oldPassword, user.password)) {
        return res.status(400).json({message: 'Incorrect password provided'});
      } else {
        const password = await bcrypt.hashSync(newUserDetails.password, 10);
        updates.password = password;
      }
    }

    await User.updateOne(
      {_id: user._id},
      {
        $set: updates,
      }
    );
    return res.status(200).json({message: 'User updated successfully'});
  } catch (error) {
    res.status(500).json({message: 'Could not update user', error});
  }
};

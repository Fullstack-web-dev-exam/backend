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
    if (newUserDetails.password && newUserDetails.oldPassword) {
      if (!bcrypt.compareSync(newUserDetails.oldPassword, user.password)) {
        return res.status(400).json({message: 'Incorrect password'});
      }
      const passwordHash = bcrypt.hashSync(newUserDetails.password, 10);
      await User.updateOne(
        {_id: user._id},
        {
          $set: {
            name: newUserDetails.name || user.name,
            surname: newUserDetails.surname || user.name,
            password: passwordHash,
          },
        }
      );
    }
    await User.updateOne(
      {_id: user._id},
      {
        $set: {
          name: newUserDetails.name || user.name,
          surname: newUserDetails.surname || user.surname,
        },
      }
    );

    return res.status(200).json({message: 'User updated successfully!'});
  } catch (error) {
    res.status(500).json({message: 'Could not update user', error});
  }
};

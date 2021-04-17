const express = require('express');
const {
  getAllUsers,
  createUser,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller');

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.patch('/', updateUser);
router.delete('/', deleteUser);

module.exports = router;

const express = require('express');
const {
  getAllUsers,
  createUser,
  deleteUser,
} = require('../controller/user.controller');

const router = express.Router();

router.get('/', getAllUsers);
router.post('/', createUser);
router.delete('/', deleteUser);

module.exports = router;

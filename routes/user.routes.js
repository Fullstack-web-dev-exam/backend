const express = require('express');
const {
  getUser,
  deleteUser,
  updateUser,
} = require('../controller/user.controller');

const router = express.Router();

router.get('/', getUser);
router.patch('/', updateUser);
router.delete('/', deleteUser);

module.exports = router;

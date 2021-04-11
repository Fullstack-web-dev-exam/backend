const express = require('express');
const {
  getUser,
  createUser,
  deleteUser,
  updateUser,
} = require('../controller/user.controller');

const router = express.Router();

router.get('/', getUser);
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

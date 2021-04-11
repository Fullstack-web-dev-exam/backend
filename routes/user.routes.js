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
||||||| 7a3befd
router.patch('/:id', updateUser);
router.delete('/:id', deleteUser);

module.exports = router;

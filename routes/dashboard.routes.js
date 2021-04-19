const express = require('express');
const {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
} = require('../controllers/dashboard.controller');

const router = express.Router();

router.post('/', createUser); // Use register route instead?
router.get('/', getAllUsers);
router.patch('/', updateUser);
router.delete('/', deleteUser);

module.exports = router;

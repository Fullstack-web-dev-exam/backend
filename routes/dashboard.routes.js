const express = require('express');
const {
  createUser,
  updateUser,
  deleteUser,
  getAllUsers,
} = require('../controllers/dashboard.controller');

const router = express.Router();
/**
 * POST
 * req.body = name, surname, role, email, password
 */
router.post('/', createUser);

/**
 * GET
 * Get all users
 * Returns name, surname, email, role
 */
router.get('/', getAllUsers);

/**
 * PATCH
 * Update users profile
 * req.body = name, surname, email, role
 */
router.patch('/', updateUser);

/**
 * DELETE
 * req.body = email
 */
router.delete('/', deleteUser);

module.exports = router;

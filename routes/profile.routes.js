const express = require('express');
const { getUser, updateUser } = require('../controllers/profile.controller');

const router = express.Router();

/**
 * GET: Get user details
 */
router.get('/', getUser);
/**
 * PATCH: User updates user details
 * req.body = name or surname or (password and oldPassword)
 */
router.patch('/', updateUser);

module.exports = router;

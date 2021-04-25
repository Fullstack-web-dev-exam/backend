const path = require('path');
const express = require('express');
const {
  sendPasswordResetEmail,
  recieveNewPassword,
} = require('../controllers/email.controller');

const router = express.Router();


/**
 * POST: Send reset password email to user
 * req.body = email
 */
router.post('/', sendPasswordResetEmail);

/**
 * POST: Update user with new password
 * req.params = userId, token
 * req.body = password
 */
router.post('/reset/:userId/:token', recieveNewPassword);

/**
 * GET: Show page where user can update password
 */
router.get('/reset/:userId/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = router;

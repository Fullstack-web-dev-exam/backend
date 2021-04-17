const path = require('path');
const express = require('express');
const {
  sendPasswordResetEmail,
  recieveNewPassword,
} = require('../controllers/email.controller');

const router = express.Router();

router.post('/', sendPasswordResetEmail);

router.post('/reset/:userId/:token', recieveNewPassword);

router.get('/reset/:userId/:token', (req, res) => {
  res.sendFile(path.join(__dirname, '../public', 'index.html'));
});

module.exports = router;

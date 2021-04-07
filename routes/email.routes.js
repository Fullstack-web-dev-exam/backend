const express = require('express');
const {
  sendPasswordResetEmail,
  recieveNewPassword,
} = require('../controller/email.controller');

const router = express.Router();

router.post('/user/:email', sendPasswordResetEmail);

router.post('/password/reset/:userId/:token', recieveNewPassword);

module.exports = router;

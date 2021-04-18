const express = require('express');
const router = express.Router();
const passport = require('passport');

module.exports = router;

const passportAuthenticate = passport.authenticate('login', {session: false});
router.post('/login', passportAuthenticate, signIn);

// router.get('/api-docs', swaggerUI.serve);


const express = require('express');
const passport = require('passport');
const jwt = require('jsonwebtoken');

require('dotenv').config();

const router = express.Router();

// Only going to be used for testing purposes
router.post(
  '/signup',
  passport.authenticate('signup', {session: false}),
  async (req, res, next) => {
    res.json({
      message: 'Signup successful',
      user: req.user,
    });
  }
);

router.post('/login', async (req, res, next) => {
  passport.authenticate('login', async (error, user, info) => {
    try {
      if (error || !user) {
        const error = new Error('An error occurred.');
        return next(info);
      }
      req.login(user, {session: false}, async error => {
        if (error) return next(error);

        const body = {_id: user._id, email: user.email, role: user.role};
        const token = jwt.sign({user: body}, process.env.TOKEN_SECRET);

        return res.json({token});
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);
});

module.exports = router;

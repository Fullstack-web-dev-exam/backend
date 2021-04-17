const Joi = require('joi');
const validateRequest = require('../middleware/validate-request');
const authorize = require('../middleware/authorize');
const Role = require('../helpers/role');
const authService = require('../auth/auth.service');
const User = require('../models/User');
const express = require('express');
const bcrypt = require('bcryptjs');

const router = express.Router();

/**
 * POST: User Register
 * req.body = email, password, role
 */
 router.post('/register', createSchema, async (req, res, next) => {
  const userDetails = req.body;

  // Check if user already exists
  if (await User.findOne({ email: userDetails.email })) {
    return res.status(400).json({ message: "User with this email already exists" });
  }

  // Create new user
  const user = new User(userDetails);
  // Hash password
  user.passwordHash = bcrypt.hashSync(userDetails.password, 10);
  user.verified = Date.now();

  try {
    // Save user
    const savedUser = await user.save();
    res.status(200).json({ message: 'User registered successfully!', savedUser })
  } catch (error) {
    next(error);
  }
});

/**
 * POST: User Login
 * req.body = email, password
 */
router.post('/login', authenticateSchema, (req, res, next) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;

  authService
    .authenticate({ email, password, ipAddress })
    .then(({ refreshToken, ...user }) => {
      setTokenCookie(res, refreshToken);
      res.json({ user, refreshToken });
    })
    .catch(next);
});

/**
 * POST: Revoke token
 * req.cookies = refreshToken || req.body = token
 */
router.post('/revoke-token', authorize(), revokeTokenSchema, (req, res) => {
  // Accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;
  console.log(token)
  if (!token) return res.status(400).json({ message: 'Token is required' });

  // Users can revoke their own token and Managers can revoke any tokens
  if (!req.user.ownsToken(token) && req.user.role !== Role.Manager) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  authService
    .revokeToken({ token, ipAddress })
    .then(() => res.json({ message: 'Token revoked' }))
    .catch(next);
});

/**
 * POST: Refresh Token
 * req.cookies = refreshToken || req.body = token
 */
router.post('/refresh-token', (req, res, next) => {
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;
  authService
    .refreshToken({ token, ipAddress })
    .then(({ refreshToken, ...user }) => {
      setTokenCookie(res, refreshToken);
      res.json(user);
    })
    .catch(next);
});

// TODO: Remember to create validateRequest

function authenticateSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
  });
  validateRequest(req, next, schema);
}

function createSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid(Role.Manager, Role.Gardener).required()
  });
  validateRequest(req, next, schema);
}

function revokeTokenSchema(req, res, next) {
  const schema = Joi.object({
    token: Joi.string().empty(''),
  });
  validateRequest(req, next, schema);
}

// helper functions
function setTokenCookie(res, token) {
  // Create cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    secure: false,
    path: '/refresh-token'
  };
  res.cookie('refreshToken', token, cookieOptions);
}

module.exports = router;

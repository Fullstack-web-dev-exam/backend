// Node modules
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const express = require('express');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Local files
const RefreshToken = require('../models/RefreshToken');
const validateRequest = require('../middleware/validate-request');
const authorize = require('../middleware/authorize');
const Role = require('../helpers/role');
const User = require('../models/User');

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
router.post('/login', authenticateSchema, async (req, res, next) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;

  const user = await User.findOne({ email });
  if (
    !user ||
    !user.isVerified ||
    !bcrypt.compareSync(password, user.passwordHash)
  ) {
    throw 'Email or password is incorrect';
  }

  try {
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user, ipAddress);
    await refreshToken.save();

    // Maybe better if frontend set cookies?
    // setTokenCookie(res, refreshToken);
    res.status(200).json({
      message: "User logged in successfully",
      user: user.email,
      jwtToken,
      refreshToken: refreshToken.token
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST: Revoke token
 * req.cookies = refreshToken || req.body = token
 */
router.post('/revoke-token', authorize(), revokeTokenSchema, async (req, res, next) => {
  // Accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;
  console.log(token);
  if (!token) return res.status(400).json({ message: 'Token is required' });

  // Users can revoke their own token and Managers can revoke any tokens
  if (!req.user.ownsToken(token) && req.user.role !== Role.Manager) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  try {
    const refreshToken = await getRefreshToken(token);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();

    res.status(200).json({
      message: "Token revoked successfully",
      user: basicDetails(refreshToken.user),
      refreshToken: refreshToken.token
    });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

/**
 * POST: Refresh Token
 * req.cookies = refreshToken || req.body = token
 */
router.post('/refresh-token', async (req, res, next) => {
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;

  try {
    const refreshToken = await getRefreshToken(token);
    const { user } = refreshToken;

    const newRefreshToken = generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByIp = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    const jwtToken = generateJwtToken(user);

    // Maybe better if frontend set cookies?
    // setTokenCookie(res, refreshToken);
    res.status(200).json({
      message: "Token refreshed successfully",
      user: user.email,
      jwtToken,
      refreshToken: newRefreshToken.token
    });

  } catch (error) {
    next(error);
  }
});

// TODO: Remember to create validateRequest

function createSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid(Role.Manager, Role.Gardener).required()
  });
  validateRequest(req, next, schema);
}

function authenticateSchema(req, res, next) {
  const schema = Joi.object({
    email: Joi.string().required(),
    password: Joi.string().required(),
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

async function getRefreshToken(token) {
  const refreshToken = await RefreshToken.findOne({ token }).populate('user');
  if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
  return refreshToken;
}

function generateJwtToken(user) {
  return jwt.sign({ _id: user.id }, process.env.TOKEN_SECRET, {
    expiresIn: '1m',
  });
}

function generateRefreshToken(user, ipAddress) {
  return new RefreshToken({
    user: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    createdByIp: ipAddress
  });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString('hex');
}

function basicDetails(user) {
  const { id, name, surname, email, role, created, updated, isVerified } = user;
  return { id, name, surname, email, role, created, updated, isVerified };
}

module.exports = router;
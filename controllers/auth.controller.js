// Node modules
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Local files
const RefreshToken = require('../models/RefreshToken');
const Role = require('../helpers/role');
const User = require('../models/User');


exports.login = async (req, res, next) => {
  const { email, password } = req.body;
  const ipAddress = req.ip;

	console.log(req.body)
	
  const user = await User.findOne({ email });

  if (
    !user ||
    !bcrypt.compareSync(password, user.password)
  ) {
    next('Email or password is incorrect');
  }
  try {
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user, ipAddress);
    await refreshToken.save();
		
    // Maybe better if frontend set cookies?
    setTokenCookie(res, refreshToken.token);
    res.status(200).json({
      message: "User logged in successfully",
      user: user.email,
      jwtToken,
    });
  } catch (error) {
    res.status(500).json({ message: 'There was a server-side error with login', error });
  }
}

exports.revokeToken = async (req, res, next) => {
  // Accept token from request body or cookie
  const token = req.body.token || req.cookies.refreshToken;
  const ipAddress = req.ip;
  // console.log(token);
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
    res.status(500).json({ message: 'There was an error revoking the token', error });
  }
}

exports.refreshToken = async (req, res, next) => {
  const token =  req.cookies.refreshToken;
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
    setTokenCookie(res, newRefreshToken.token);
    res.status(200).json({
      message: "Token refreshed successfully",
      user: user.email,
      jwtToken,
    });

  } catch (error) {
    res.status(500).json({message: 'There was an error creating a new refresh token', error});
  }
}

// TODO: Remember to create validateRequest

// helper functions
function setTokenCookie(res, token) {
  // Create cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    secure: false,
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
    expiresIn: '5m',
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

// Node modules
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

// Local files
const RefreshToken = require('../models/RefreshToken');
const User = require('../models/User');

// User login with email and password
exports.login = async (req, res) => {
  const {email, password} = req.body;
  const ipAddress = req.ip;

  const user = await User.findOne({email});
  // If there is no user with email or the password does not match throw error
  if (!user || !bcrypt.compareSync(password, user.password)) {
    return res
      .status(400)
      .json({error: 'Wrong email and/or password. Please try again.'});
  }

  // Generate JWT and Refresh token
  // Set refreshtoken in cookie
  // Return object with role and JWT token
  try {
    const jwtToken = generateJwtToken(user);
    const refreshToken = generateRefreshToken(user, ipAddress);
    await refreshToken.save();

    setTokenCookie(res, refreshToken.token);
    res.status(200).json({
      message: 'User logged in successfully',
      role: user.role,
      jwtToken,
    });
  } catch (error) {
    res
      .status(500)
      .json({error: 'There was a server-side error with login', error});
      console.log(error);
  }
};

exports.revokeToken = async (req, res) => {
  // Accept token from request body or cookie
  const token = req.cookies.refreshToken || req.body.token;
  const ipAddress = req.ip;

  if (!token) return res.status(400).json({error: 'Token is required'});

  // Users can revoke their own token and Managers can revoke any tokens
  if (!req.user.ownsToken(token) && req.user.role !== 'manager') {
    return res.status(401).json({error: 'Unauthorized'});
  }

  // Get refreshtoken using helper function
  // Set revoked information and save
  try {
    const refreshToken = await getRefreshToken(token);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    await refreshToken.save();

    res.status(200).json({
      message: 'Token revoked successfully',
      user: refreshToken.user.email,
    });
  } catch (error) {
    res
      .status(500)
      .json({error: 'There was an error revoking the token', error});
  }
};

exports.refreshToken = async (req, res) => {
  const token = req.cookies.refreshToken;
  const ipAddress = req.ip;

  // Generates refresh token using user information and ip address
  // revokes old refresh token (if any)
  // saves new and old refresh token
  // Generates and returns new JWT token (valid for 15 minutes)
  try {
    const refreshToken = await getRefreshToken(token);
    // destructure user out of refreshToken
    const {user} = refreshToken;

    const newRefreshToken = generateRefreshToken(user, ipAddress);
    refreshToken.revoked = Date.now();
    refreshToken.revokedByIp = ipAddress;
    refreshToken.replacedByIp = newRefreshToken.token;
    await refreshToken.save();
    await newRefreshToken.save();

    const jwtToken = generateJwtToken(user);

    setTokenCookie(res, newRefreshToken.token);
    res.status(200).json({
      message: 'Token refreshed successfully',
      user: user.email,
      jwtToken,
    });
  } catch (error) {
    res.status(500).json({
      error: 'There was an error creating a new refresh token',
      error,
    });
  }
};

// helper functions
function setTokenCookie(res, token) {
  // Create cookie with refresh token that expires in 7 days
  const cookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    secure: true,
    sameSite: 'none',
  };
  res.cookie('refreshToken', token, cookieOptions);
}

async function getRefreshToken(token) {
  const refreshToken = await RefreshToken.findOne({token}).populate('user');
  if (!refreshToken || !refreshToken.isActive) throw 'Invalid token';
  return refreshToken;
}

function generateJwtToken(user) {
  return jwt.sign({_id: user.id}, process.env.TOKEN_SECRET, {
    expiresIn: '15m',
  });
}

function generateRefreshToken(user, ipAddress) {
  return new RefreshToken({
    user: user.id,
    token: randomTokenString(),
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
    createdByIp: ipAddress,
  });
}

function randomTokenString() {
  return crypto.randomBytes(40).toString('hex'); // generates random hex string
}

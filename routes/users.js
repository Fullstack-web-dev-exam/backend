const express = require('express');

const router = express.Router();

const authorize = require('../middleware/authorize');

const Role = require('helpers/role');
const {authenticate, authenticateSchema, createSchema, create, revokeTokenSchema, revokeToken, refreshToken} = require('../controllers/user');

const User = require('../models/User');

// Routes

// router.post('/login', authenticateSchema, authenticate)
// router.post('/create', createSchema, create)
// router.post('/revoke', authorize('manager'), revokeTokenSchema, revokeToken)
// router.post('/refresh-token', refreshToken)

router.get('/', (req, res) => {
	res.send('Hey');
});

module.exports = router;

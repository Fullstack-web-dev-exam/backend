const express = require('express');
const Joi = require('joi');

const validateRequest = require('../middleware/validate-request');
const authorize = require('../middleware/authorize');
const auth = require('../controllers/auth.controller');
const Role = require('../helpers/role');

const router = express.Router();

/**
 * POST: User Login
 * req.body = email, password
 */
router.post('/login', authenticateSchema, auth.login);

/**
 * POST: Revoke token
 */
router.post('/revoke-token', authorize(), auth.revokeToken);

/**
 * POST: Refresh Token
 */
router.post('/refresh-token', auth.refreshToken);

module.exports = router;

function authenticateSchema(req, res, next) {
    const schema = Joi.object({
        email: Joi.string().required(),
        password: Joi.string().required(),
    });
    validateRequest(req, next, schema);
}

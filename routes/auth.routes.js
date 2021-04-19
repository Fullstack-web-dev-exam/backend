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
 * req.cookies = refreshToken || req.body = token
 */
router.post('/revoke-token', revokeTokenSchema, authorize(), auth.revokeToken);

/**
 * POST: Refresh Token
 * req.cookies = refreshToken || req.body = token
 */
router.post('/refresh-token', auth.refreshToken);


module.exports = router;



function registerSchema(req, res, next) {
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
const express = require('express');
const passport = require('passport');
const {getUser, updateUser} = require('../controller/profile.controller');

const router = express.Router();

router.get('/', getUser);
router.patch('/', updateUser);

module.exports = router;

const express = require('express');
const {getUser, updateUser} = require('../controller/user.controller');

const router = express.Router();

router.get('/', getUser);
router.patch('/', updateUser);

module.exports = router;

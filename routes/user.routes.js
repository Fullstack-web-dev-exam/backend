const express = require('express');
const { getUser, createUser, updateUser, deleteUser, getAllUsers} = require('../controllers/user.controller');

const router = express.Router();

router.get('/user', getUser);
router.post('/', createUser); // Use register route instead?
router.patch('/', updateUser);
router.delete('/', deleteUser);

router.get('/', getAllUsers);

module.exports = router;

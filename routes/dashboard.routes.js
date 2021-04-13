const express = require('express');
const {
  getAllUsers,
  createUser,
  deleteUser,
  updateUser,
} = require('../controller/dashboard.controller');

const {Manager} = require('../middleware/role.middleware');

const router = express.Router();


// /**
// 	* GET /dashboard
// 	*@summary this is manager route for getting all users
// 	*@return {object} 200 - success response
// */
router.get('/', Manager, getAllUsers);
router.post('/', Manager, createUser);
router.delete('/', Manager, deleteUser);
router.patch('/', Manager, updateUser);

module.exports = router;

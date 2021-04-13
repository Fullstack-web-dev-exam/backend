const router = require('express-promise-router')();
const passport = require('passport');
const {signIn} = require('../controller/auth.controller');

// require('dotenv').config();


const passportLogin = passport.authenticate('login', {session: false});
const passportJWT = passport.authenticate('jwt', {session: false});

// /**
//  *	components:
//  *		securitySchemes:
//  *			cookieAuth:
//  *				type: apiKey
//  *				in: cookie
//  *				name: access_token
// */

// 
// /**
//  * @swagger
//  * /login:
//  *   post:
//  *     summary: Returns a list of users.
//  *     description: Optional extended description in Markdown.
//  *     produces:
//  *       - application/json
//  *     responses:
//  *       200:
//  *         description: OK
//  *		 		 content:
//  *           application/json:
// */
router.route('/login').post(passportLogin, signIn, passportJWT);
// router.get('/api-docs', swaggerUI.serve);
module.exports = router;

const router = require('express-promise-router')();
const passport = require('passport');

require('dotenv').config();
const {signIn} = require('../controller/user.controller');

const {validateBody, schemas} = require('../helpers/routeHelpers');

const passportSignIn = passport.authenticate('local', {session: false});
const passportJWT = passport.authenticate('jwt', {session: false});

// // Only going to be used for testing purposes
// router.post(
//   '/signup',
//   passport.authenticate('signup', {session: false}),
//   async (req, res, next) => {
//     res.json({
//       message: 'Signup successful',
//       user: req.user,
//     });
//   }
// );

router
  .route('/login')
  .post(validateBody(schemas.authSchema), passportSignIn, signIn);

// router.route('/login').post(passportSignIn, function (req, res) {
//   res.send('message: test');
// });
// router.post('/login', async (req, res, next) => {
//   passport.authenticate('login', async (error, user, info) => {
//     try {
//       if (error || !user) {
//         const error = new Error('An error occurred.');
//         return next(info);
//       }
//       req.login(user, {session: false}, async error => {
//         if (error) return next(error);

//         const body = {_id: user._id, email: user.email, role: user.role};
//         const token = jwt.sign({user: body}, process.env.TOKEN_SECRET);

//         return res.json({token});
//       });
//     } catch (error) {
//       return next(error);
//     }
//   })(req, res, next);
// });

module.exports = router;

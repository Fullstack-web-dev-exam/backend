const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Verify the JWT Token
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const UserModel = require('../model/user.model');

const cookieExtractor = req => {
  let token = null;
  if (req && req.cookies) {
    token = req.cookies.access_token;
  }
  return token;
};

require('dotenv').config();

// Only going to be used for testing purposes
// passport.use(
//   'signup',
//   new LocalStrategy(
//     {
//       usernameField: 'email',
//       passwordField: 'password',
//       passReqToCallback: true,
//     },
//     async (req, email, password, done) => {
//       try {
//         const {name, surname, role, place, status} = req.body;
//         const user = await UserModel.create({
//           name,
//           surname,
//           email,
//           role,
//           password,
//           place,
//           status,
//         });
//         return done(null, user);
//       } catch (error) {
//         done(error);
//       }
//     }
//   )
// );

// JSON WEB TOKEN STRATEGY
passport.use(
  new JWTstrategy(
    {
      jwtFromRequest: cookieExtractor,
      secretOrKey: process.env.TOKEN_SECRET,
      passReqToCallback: true,
    },
    async (req, payload, done) => {
      try {
        // Find user specified in token
        const user = await UserModel.findById(payload.sub);
        console.log(user);
        // if user doesn't exist, handle it
        if (!user) {
          console.log('hey');
          return done(null, false);
        }

        // Otherwise return user
        req.user = user;
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);

// Local strategy
passport.use(
  'local',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
        console.log(email);
        // Find user with given email
        const user = await UserModel.findOne({'local.email': email});

        // Handle if not exists
        if (!user) return done(null, false, {message: 'User not found'});

        // Validate password (check if correct)
        const validate = await user.isValidPassword(password);

        // If password not correct send message to user
        if (!validate)
          return done(null, false, {message: 'Wrong username and/or password'});

        return done(null, user, {message: 'User logged in successfully'});
      } catch (error) {
        console.log(error);
        return done(error, false);
      }
    }
  )
);

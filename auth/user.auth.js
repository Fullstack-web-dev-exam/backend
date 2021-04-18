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
        // if user doesn't exist, handle it
        if (!user) {
          return done(null, false);
        }
				console.log(user)
        // Otherwise return user
        req.user = user;
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    }
  )
);
passport.use(
  'login',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
    },
    async (email, password, done) => {
      try {
				const user = await UserModel.findOne({'email': email});

        if (!user) return done(null, false, {message: 'User not found'});

        const validate = await user.isValidPassword(password);

        if (!validate)
          return done(null, false, {message: 'Wrong username and/or password'});

				// const refreshtoken = generateRefreshToken(user, user.ipAddress);

				//save refresh token
				// await refreshtoken.save()

				return done(null, user,  {message: 'User logged in successfully'});
      } catch (error) {
        return done(error);
      }
    }
  )
);

// passport.use(
//   new JWTstrategy(
//     {
//       secretOrKey: process.env.TOKEN_SECRET,
//       jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
//     },
//     async (token, done) => {
//       try {
//         return done(null, token.user);
//       } catch (error) {
//         done(error);
//       }
//     }
//   )
// );

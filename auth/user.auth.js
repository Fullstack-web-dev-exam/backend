const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;

// Verify the JWT Token
const JWTstrategy = require('passport-jwt').Strategy;
const ExtractJWT = require('passport-jwt').ExtractJwt;

const UserModel = require('../models/user.model');

require('dotenv').config();

// Only going to be used for testing purposes
passport.use(
  'signup',
  new LocalStrategy(
    {
      usernameField: 'email',
      passwordField: 'password',
      passReqToCallback: true,
    },
    async (req, email, password, done) => {
      try {
        const {name, surname, role, place, status} = req.body;
        const user = await UserModel.create({
          name,
          surname,
          email,
          role,
          password,
          place,
          status,
        });
        return done(null, user);
      } catch (error) {
        done(error);
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
        const user = await UserModel.findOne({email});

        if (!user) return done(null, false, {message: 'Wrong username and/or password'});

        const validate = await user.isValidPassword(password);

        if (!validate)
          return done(null, false, {message: 'Wrong username and/or password'});

        return done(null, user, {message: 'User logged in successfully'});
      } catch (error) {
        return done(error);
      }
    }
  )
);

passport.use(
  new JWTstrategy(
    {
      secretOrKey: process.env.TOKEN_SECRET,
      jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
    },
    async (token, done) => {
      try {
        return done(null, token.user);
      } catch (error) {
        done(error);
      }
    }
  )
);

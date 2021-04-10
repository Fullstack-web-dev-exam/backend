const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
require('dotenv').config();

const app = express();

// Cookies
app.use(cookieParser());
// Easier to see what requests are sent via postman
app.use(morgan('dev'));
// parse request of content-type - application/json
app.use(express.json());
// parse request of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));
require('./auth/user.auth');

// Route handlers
const generalRoute = require('./routes/routes');
const userRoute = require('./routes/user.routes');
const dashboardRoute = require('./routes/dashboard.routes');
const resetRoute = require('./routes/email.routes');
// Middlewares

// Not whitelisted atm, this is for development purposes
app.use(
  cors({
    origin: 'http://localhost:3000',
    credentials: true,
  })
);
// Authenticate user
const authUser = passport.authenticate('jwt', {session: false});

const hasRole = require('./middleware/role.middleware');

app.use('/', generalRoute);
app.use('/user', authUser, hasRole.User, userRoute);
app.use('/dashboard', authUser, hasRole.Manager, dashboardRoute);
app.use('/reset_password', resetRoute);

// Database
mongoose
  .connect(process.env.DATABASE_CONNECT_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false,
  })
  .then(() => {
    console.log('Connection to databse established');
    // Set port, and listen for requests
    const {PORT} = process.env;
    app.listen(PORT, () => {
      console.log(`Server listening on port ${PORT}`);
    });
  })
  .catch(err => {
    console.log("Couldn't connect to the databse", err);
    process.exit();
  });

// Handle errors.
app.use((err, res) => {
  res.status(err.status || 500);
  res.json({error: err});
});

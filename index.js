const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config();

const app = express();
require('./auth/user.auth');

// Route handlers
const generalRoute = require('./routes/routes');
const userRoute = require('./routes/user.routes');
const dashboardRoute = require('./routes/dashboard.routes');
const resetRoute = require('./routes/email.routes');
// Middlewares

// parse request of content-type - application/json
app.use(express.json());
// parse request of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));
// Not whitelisted atm, this is for development purposes
app.use(cors());
// Easier to see what requests are sent via postman
app.use(morgan('dev'));
// Authenticate user
const authUser = passport.authenticate('jwt', {session: false});

const hasRole = require('./middleware/role.middleware');

app.use('/', generalRoute);
app.use('/user', authUser, hasRole.User, userRoute);
app.use('/dashboard', authUser, hasRole.Manager, dashboardRoute);
app.use('/forgotpassword', resetRoute);

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
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({error: err});
});

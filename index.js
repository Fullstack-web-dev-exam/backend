require('dotenv').config();
require('./passport');

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');

const app = express();

// Route handlers
const generalRoute = require('./routes/routes');
const userRoute = require('./routes/user.routes');
const dashboardRoute = require('./routes/dashboard.routes');
const resetRoute = require('./routes/email.routes');

// Import controllers
const userController = require('./controllers/auth');

// Middlewares

// parse request of content-type - application/json
app.use(express.json());
// parse request of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
// Not whitelisted atm, this is for development purposes
app.use(cors());
// Easier to see what requests are sent via postman
app.use(morgan('dev'));
// Authenticate user
const authUser = passport.authenticate('jwt', { session: false });

const hasRole = require('./middleware/role.middleware');

app.use('/', generalRoute);
app.use('/user', authUser, hasRole.User, userRoute);
app.use('/dashboard', authUser, hasRole.Manager, dashboardRoute);
app.use('/reset_password', resetRoute);
app.use('/authenticate', userController);

// Connect to DB
mongoose.connect(
  process.env.DATABASE_CONNECT_URI,
  { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true, useFindAndModify: false },
  () => { console.log('Connected to DB!'); }
);

// Start server
const port = process.env.PORT;
app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});

// Handle errors.
app.use((err, req, res, next) => {
  res.status(err.status || 500);
  res.json({ error: err });
});

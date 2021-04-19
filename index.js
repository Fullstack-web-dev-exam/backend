require('dotenv').config();
require('./auth/user.auth');

const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser')

const app = express();

// Route handlers
const userRoute = require('./routes/user.routes');
const profileRoute = require('./routes/profile.routes');
//const dashboardRoute = require('./routes/dashboard.routes');
const resetRoute = require('./routes/email.routes');
const authRoute = require('./routes/auth.routes');

// Middlewares
// parse request of content-type - application/json
app.use(express.json());
// parse request of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser())
// Not whitelisted atm, this is for development purposes
if (
  process.env &&
  process.env.NODE_ENV &&
  process.env.NODE_ENV === 'production'
) {
  app.use(cors({credentials: true, origin: process.env.FRONTENDHOST}));
} else {
  app.use(cors());
}
// Easier to see what requests are sent via postman
app.use(morgan('dev'));
// Authenticate user
const authUser = passport.authenticate('jwt', { session: false });

const hasRole = require('./middleware/role.middleware');

app.use('/', authRoute);
app.use('/profile', authUser, hasRole.User, profileRoute);
app.use('/users', authUser, hasRole.User, userRoute);
//app.use('/dashboard', authUser, hasRole.Manager, dashboardRoute);
app.use('/reset_password', resetRoute);

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
// app.use((err, req, res, next) => {
//   res.status(err.status || 500);
//   res.json({ error: err });
// });

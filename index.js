const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUI = require('swagger-ui-express');
// const options = require('./swagger.yaml')
require('dotenv').config();

const options = {
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'fullstack-exam',
      version: '1.0.0',
      description: 'A simple fullstack exam',
    },
    servers: [
      {
        url: 'https://locahost:5000',
      },
    ],
  },
  apis: ['./routes/*.js'],
};

const specs = swaggerJsDoc(options);

const app = express();
require('./auth/user.auth');

// Route handlers
const generalRoute = require('./routes/auth.routes');
const profileRoute = require('./routes/profile.routes');
const dashboardRoute = require('./routes/dashboard.routes');
const forgotPasswordRoute = require('./routes/email.routes');

// Middlewares
app.use(cookieParser());
// parse request of content-type - application/json
app.use(express.json());
// parse request of content-type - application/x-www-form-urlencoded
app.use(express.urlencoded({extended: true}));
// Not whitelisted atm, this is for development purposes
app.use(cors());
// Easier to see what requests are sent via postman
app.use(morgan('dev'));

app.use('/api-docs', swaggerUI.serve, swaggerUI.setup(specs));
// Authenticate user
// const authUser = passport.authenticate('jwt', {session: false});
const hasRole = require('./middleware/role.middleware');

app.use('/', generalRoute);
// app.use('/profile', profileRoute)
app.use('/profile', hasRole.User, profileRoute);
// app.use('/dashboard', authUser, hasRole.Manager, dashboardRoute);
app.use('/dashboard', dashboardRoute);
app.use('/forgotpassword', forgotPasswordRoute);

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
  res.status(err.status || err);
  res.json({error: err});
});

var createError = require('http-errors');
var express = require('express');
var cookieParser = require('cookie-parser');
var path = require('path');
var logger = require('morgan');
const bodyParser = require('body-parser');
const flash = require('connect-flash');
const validator = require('express-validator');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const getPayloadToken = require('./middlewares/verify-token');
const cors = require('cors');

const indexRouter = require('./routes/index');
const usersRouter = require('./routes/user/user');

var app = express();
dotenv.config();

// Config kết nối db
require('./config/db-connection');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(validator());
app.use(cookieParser());
app.use(session({
  secret: process.env.SECRET_KEY,
  store: new MongoStore({mongooseConnection: mongoose.connection}),
  cookie: {
    maxAge: 180 * 60 * 1000,
    sameSite: "none",
    httpOnly: true,
    path: "/"
  } // Phút * giây * mili giây
}));
app.use(flash());
app.use(express.static(path.join(__dirname, 'public')));

// Config passport
require('./config/passport');

const allowOrigin = [/localhost:3000$/, /localhost:3001$/, /caro-web.herokuapp.com$/, /1612421.github.io$/];

const corsOptions = {
  origin: allowOrigin,    // reqexp will match all prefixes
  methods: "GET,HEAD,POST,PATCH,DELETE,OPTIONS",
  credentials: true,                // required to pass
  allowedHeaders: "Content-Type, Authorization, X-Requested-With",
}

// intercept pre-flight check for all routes
app.options('*', cors(corsOptions))

app.use(cors(corsOptions));
app.use(function(req, res, next) {
  res.header('Access-Control-Allow-Credentials', true);
  res.header('Access-Control-Allow-Origin', req.headers.origin);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
  res.header('Access-Control-Allow-Headers', 'X-Requested-With, X-HTTP-Method-Override, Content-Type, Accept');
  next();
});
app.use(getPayloadToken);
app.use('/user', usersRouter);
app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.json({messages: err.message});
});

module.exports = app;

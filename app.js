let createError, express, path, cookieParser, logger, indexRouter, usersRouter, potholeRoutes, seedRouter, app;
createError = require('http-errors');
express = require('express');
path = require('path');
cookieParser = require('cookie-parser');
logger = require('morgan');
indexRouter = require('./routes/index');
usersRouter = require('./routes/users');
potholeRoutes = require('./routes/damnThePotholes');
app = express();


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//Set up mongoose connection
let mongoose = require('mongoose');
// NOTE: This URL should point to the database, not the collection as that is determined in the model
let mongoDB = 'mongodb+srv://app_dtp:DTPP0tH0l3@cluster0-mhpvz.gcp.mongodb.net/DamnThePotHoles?retryWrites=true';
mongoose.connect(mongoDB, {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/damnthepotholes', potholeRoutes);

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
  res.render('error');
});

module.exports = app;

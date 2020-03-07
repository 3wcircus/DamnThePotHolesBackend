/*******************************************************
 *  POINT OF ENTRY - https://www.dailymotion.com/video/xtwoas :-)
 *******************************************************/
let createError, express, path, cookieParser, indexRouter, usersRouter, potholeRoutes, seedRouter, app;

createError = require('http-errors');
express = require('express');
path = require('path');
cookieParser = require('cookie-parser');
indexRouter = require('./routes/index');
usersRouter = require('./routes/users');
potholeRoutes = require('./routes/damnThePotholes');
apiRouter = require('./routes/api');
aboutmeRouter = require('./routes/aboutme')
contactRouter = require('./routes/contact')

const config = require('./config/config');
const isDev = process.env.NODE_ENV !== 'production'; // Determine if running in dev environment or production
// create a rolling file logger based on date/time that fires process events
const log = require('simple-node-logger');
const logger_opts = {
    errorEventName: 'error',
    logDirectory: './logs', // NOTE: folder must exist and be writable...
    fileNamePattern: 'dtp-<DATE>.log',
    dateFormat: 'YYYY.MM.DD'
};
const logger = log.createRollingFileLogger(logger_opts);
logger.info('Server Running in DEV mode: ', isDev);

// Get reference for Express
app = express();

// Bootstrap
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/js', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('ejs', require('ejs-locals'));
app.set('view engine', 'ejs');


// app.set('view engine', 'pug'); // Replaced PUG with EJS - K.E.Y.

// Use these
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


/*
    SETUP OuR DB CNXN
 */
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);

let mongoDB = "";
if (isDev)
{
    mongoDB = config.db_dev;
}
else
{
    mongoDB = config.db;
}
logger.info('Connecting to MongoDB at ', mongoDB);
mongoose.connect(mongoDB, {useNewUrlParser: true});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

/*
    SETUP ALL OUR ROUTES
 */
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/dtp', potholeRoutes);
app.use('/api', apiRouter);
app.use('/aboutme', aboutmeRouter)
app.use('/contact', contactRouter)

// catch 404 and forward to error handler (that does basically nothing atm)
app.use(function (req, res, next)
{
    next(createError(404));
});

// Generic error handler
// TODO: Implement some real exception handling
app.use(function (err, req, res, next)
{
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

// Export a reference
module.exports = app;

var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var index = require('./routes/index');
var block = require('./routes/block');
var tx = require('./routes/tx');
var account = require('./routes/account');
var accounts = require('./routes/accounts');
var contract = require('./routes/contract');
var signature = require('./routes/signature');
var search = require('./routes/search');

var config = require('./config.js');

var level = require('level');
var db = level('./data');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');
app.set('config', config);
app.set('db', db);
app.set('trust proxy', true);

app.use(favicon(path.join(__dirname, 'public/favicon', 'lis.png')));
app.use(logger(config.logFormat));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.locals.moment = require('moment');
app.locals.numeral = require('numeral');
app.locals.ethformatter = require('./utils/ethformatter.js');
app.locals.nameformatter = new(require('./utils/nameformatter.js'))(config);
app.locals.nodeStatus = new(require('./utils/nodeStatus.js'))();
app.locals.blockIndexer = require('./utils/block-indexer');
app.locals.blockIndexer.start();
app.locals.config = config;

app.use('/', index);
app.use('/block', block);
app.use('/tx', tx);
app.use('/account', account);
app.use('/accounts', accounts);
app.use('/contract', contract);
app.use('/signature', signature);
app.use('/search', search);
app.use('/stats', function (req,res,next) {
  // body...
  res.render('stats');
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  console.log(err)
  // set locals, only providing error in development
  res.locals.message = 'Something went wrong';
  res.locals.error = req.app.get('env') === 'development' ? {} : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;

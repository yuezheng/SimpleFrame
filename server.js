'use strict';

// default port for this service
var PORT = 4200;
var HOST = '0.0.0.0';
var VIEW_FILE = './etc/view.json';
var PROGRAME = 'simpleframe';

/**
 * Options Initialization
 */
var opt = require('node-getopt').create([
  ['h' , 'host=' + HOST     , 'Listening host, default is ' + HOST],
  ['p' , 'port=' + PORT     , 'Starting port, default is ' + PORT],
  ['f' , 'file=' + VIEW_FILE, 'view config file, default is ' + VIEW_FILE],
  ['h' , 'help'             , 'display this help'],
  ['v' , 'version'          , 'show version']
])
.bindHelp()
.parseSystem();

var packageJson = require('./package.json');

var port = PORT;
var host = HOST;
var view_file = VIEW_FILE;
var options = opt['options'];
var optionsKeys = Object.keys(options);

for(var i in optionsKeys) {
    switch(optionsKeys[i]) {
        case 'host':
            host = options['host'];
            break;
        case 'port':
            port = options['port'];
            break;
        case 'file':
            view_file = options['file'];
            break;
        case 'version':
            console.info(packageJson.version);
            process.exit(0);
            break;
        default:
            break;
    }
}

var express = require('express')
  , session = require('express-session')
  , passport = require('passport')
  , mongoose = require('mongoose')
  , passport = require('passport')
  , mongoStore = require('connect-mongo')({
      session: session
  })
  , bodyParser = require('body-parser')
  , cookieParser = require('cookie-parser')
  , methodOverride = require('method-override')
  , nconf = require('nconf')
  , favicon = require('static-favicon')
  , fs = require('fs')
  , path = require('path')
  , i18n = require('i18n')
  , fileUtils = require('./utils/getFiles');

// load configuration file
var configFile = '/etc/' + PROGRAME + '/config.json';
if(! fs.existsSync(configFile)) {
    configFile = './etc/config.json';
}
var conf = nconf.file({file: configFile});

i18n.configure({
  locales: ["en_US", "zh_CN"],
  defaultLocale: "zh_CN",
  directory: "./locale",
  updateFiles: false,
  indent: "\t",
  extension: ".json"
});
global.i18n = i18n;

var app = express();

fileUtils.getGlobbedFiles('./app/models/**/*.js').forEach(function(modelPath) {
  require(path.resolve(modelPath));
});

module.exports = app;

var db_name = conf.get('db');
if ('test' === app.get('env')) {
    port = 4201;
    db_name += "_test"
}

var db = mongoose.connect(conf.get('db'), function(err) {
  if (err) {
    console.error('Could not connect to MongoDB!');
    console.log(err);
  }
});

// load view configuration file
var view_conf = nconf.file({file: view_file});

app.use(cookieParser());

app.use(session({
    saveUninitialized: true,
    resave: true,
    secret: 'ecmaster',
    store: new mongoStore({
        db: db.connection.db,
        collection: 'sessions'
    })
}));

app.set('port', port);

// view engine setup
var view_path = view_conf.get('view_path') || 'views';
if ('production' === app.get('env')) {
    view_path = 'public'
}
if(view_path.substr(0, 1) != '/') {
    view_path = path.join(__dirname, view_path);
}
app.set('views', view_path);

app.use(favicon(path.join(view_path, 'favicon.ico')));
app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(bodyParser.json());
app.use(methodOverride());
app.use(express.static(view_path));

// use passport session
app.use(passport.initialize());
app.use(passport.session());

var router = require('./router');
router.setup(app);

require('./passport')();

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    res.status(404);
    next(req, res)
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});

var server = app.listen(app.get('port'), host, function() {
    console.info('Express [%s] server listening on http://%s:%s',
        app.get('env'), host, server.address().port);
});

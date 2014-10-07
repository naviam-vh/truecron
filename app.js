var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');

var config = require('./lib/config');

var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
// vh: first redis should be running on vagrant instance
//var redisClient = require('./lib/redis');
var RedisStore = require('connect-redis')(session);

var passport = require('passport'),
    GoogleStrategy = require('passport-google-oauth').OAuth2Strategy;

var routes = require('./routes/index');
var users = require('./routes/users');
var auth = require('./routes/auth');
var api = require('./routes/api');

var exphbs  = require('express-handlebars');

var app = express();

// view engine setup
var hbs = exphbs.create({
    defaultLayout: 'default',
    helpers: require("./public/js/lib/handlebars-helpers.js").helpers
});
// dv: adding new helper "rawinclude" to handlebars
require('handlebars-helper-rawinclude').register(hbs.handlebars, {}, {assemble: null});

app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/bower_components',  express.static(__dirname + '/bower_components'));

app.use(cookieParser('TrueCron')); // dv: hack to fix problem with passport and redis session. @see https://github.com/jaredhanson/passport/issues/244
app.use(session({
    store: new RedisStore({}), //client: redisClient
    secret: config.get('SESSION_SECRET') || '3rrr',
    cookie : {
        expires: false,
        domain: config.get('COOKIE_DOMAIN') || 'dev.truecron.com'
    },
    resave: true,
    saveUninitialized: true
}));

// passport initialization
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
    console.log('serializeUser');
    console.log(user);
    done(null, user);
});

passport.deserializeUser(function(user, done) {
    console.log('deserializeUser');
    console.log(user);
    done(null, user);
});

passport.use('google', new GoogleStrategy({
        clientID: config.get('GOOGLE_SSO_CLIENT_ID') || '182911798819-t360tlk839gij3m46pgo4noticrqi4s3.apps.googleusercontent.com',
        clientSecret: config.get('GOOGLE_SSO_CLIENT_SECRET') || '1gcqd1YRgD-Ui3vYyYu7z926',
        callbackURL: config.get('GOOGLE_SSO_CALLBACK_URL') || 'http://dev.truecron.com/auth/google/callback'
    },
    function(accessToken, refreshToken, profile, done) {
        // asynchronous verification, for effect...
        process.nextTick(function () {
            // console.log(profile);
            // To keep the example simple, the user's Google profile is returned to represent the logged-in user
            return done(null, profile);
        });
    }
));

app.get('/auth/google', passport.authenticate('google', { scope: [
    'https://www.googleapis.com/auth/userinfo.profile',
    'https://www.googleapis.com/auth/userinfo.email'
]}));

app.get('/auth/google/callback',
    passport.authenticate('google', { failureRedirect: '/#/signin' }),
    function(req, res) {
        // dv: TODO: save token to storage
        // console.log(req.user);

        // Successful authentication, redirect home.
        res.redirect('/');
});

app.get('/configs', function(req,res) {
   res.json(
       {
           'NODE_ENV': config.get('NODE_ENV'),
           'IP': config.get('IP'),
           'PORT': config.get('PORT'),
           'SESSION_SECRET': config.get('SESSION_SECRET'),
           'POSTGRE_HOST': config.get('POSTGRE_HOST'),
           'POSTGRE_PORT': config.get('POSTGRE_PORT'),
           'POSTGRE_DATABASE': config.get('POSTGRE_DATABASE'),
           'POSTGRE_USERNAME': config.get('POSTGRE_USERNAME').length,
           'POSTGRE_PASSWORD': config.get('POSTGRE_PASSWORD').length,
           'REDIS_HOST': config.get('REDIS_HOST'),
           'REDIS_PORT': config.get('REDIS_PORT'),
           'REDIS_PASSWORD': config.get('REDIS_PASSWORD').length,
           'AWS_ACCESS_KEY_ID': config.get('AWS_ACCESS_KEY_ID'),
           'AWS_SECRET_ACCESS_KEY': config.get('AWS_SECRET_ACCESS_KEY'),
           'GOOGLE_SSO_CLIENT_ID': config.get('GOOGLE_SSO_CLIENT_ID'),
           'GOOGLE_SSO_CLIENT_SECRET': config.get('GOOGLE_SSO_CLIENT_SECRET'),
           'GOOGLE_SSO_CALLBACK_URL': config.get('GOOGLE_SSO_CALLBACK_URL'),
           'GOOGLE_ANALYTICS_TRACKING_ID': config.get('GOOGLE_ANALYTICS_TRACKING_ID')
       }
   );
});

app.use('/', routes);
app.use('/auth', auth);
app.use('/users', users);
app.use('/api/v1', api);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

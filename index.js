import cron from 'cron';
import path from 'path';
import logger from 'morgan';
import express from 'express';
import mongoose from 'mongoose';
import passport from 'passport';
import shell from 'python-shell'
import favicon from 'serve-favicon';
import bodyParser from 'body-parser';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import passportLocal from 'passport-local';

import config from './config/config';

import Account from './models/account';

const CronJob = cron.CronJob;

const LocalStrategy = passportLocal.Strategy;
const app = express();

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
    secret: 'matigasishard',
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use('/api', require(path.join(__dirname, '/config/router'))(express.Router()));
app.use(express.static(path.join(__dirname, './public')));

// configure passport
passport.use(Account.createStrategy());
passport.serializeUser(Account.serializeUser());
passport.deserializeUser(Account.deserializeUser());

mongoose.connect(config.DB_URL);
mongoose.Promise = global.Promise;

app.get('/api/*', (req, res) => {
    res.status(403).send({
        'message': 'Nothing to see here.'
    });
});

app.use('*', (req, res) => {
    res.sendFile('index.html', { root: __dirname + '/public'});
});

let options = {
    scriptPath: __dirname + '/'
}

let updateJob = new CronJob('0 0 0 * * *', () => {
    shell.run('update_farminfo.py', options, (err, reslts) => {
        if(err) {
            console.log(err);
        } else {
            console.log('Farms have been updated for yesterday.')
        }
    });
}, null, true);

export default app;

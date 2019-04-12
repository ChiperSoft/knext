
var { resolve }   = require('path');
var express       = require('express');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var boom          = require('boom');

var app = module.exports = exports = express();

app.get('/favicon.ico', (req, res) => res.status(404).send()); // ignore favicons
app.use(express.static(resolve(__dirname, '../public')));
app.use(express.static(resolve(__dirname, '../../public')));

app.use(require('./middleware/logger')('www/request'));

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(require('./router'));

app.get('/ok', (req, res) => res.send('OK'));

// 404 handler
app.use((req, res, next) => next(boom.notFound('The requested path does not exist')));

app.use(require('./middleware/error-handler')('www/request'));

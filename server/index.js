
var config        = require('config');
var { resolve, join, basename }   = require('path');
var express       = require('express');
var cookieParser  = require('cookie-parser');
var bodyParser    = require('body-parser');
var logger        = require('./log');
var reactExpress  = require('./react');
var glob          = require('glob');
var boom          = require('boom');

var log = logger('server/index');

var app = module.exports = exports = express();
app._config = config;

app.get('/favicon.ico', (req, res) => res.status(404).send()); // ignore favicons
app.use(express.static(resolve(__dirname, '../public')));
app.use(express.static(resolve(__dirname, '../../public')));

app.use(logger.middleware());

app.use(cookieParser());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(reactExpress.renderer);

var router = express.Router();
var pagesPath = resolve(__dirname, '..', 'pages');
log.debug('Loading pages from', pagesPath);
glob.sync(join(pagesPath, '**', '*.js')).forEach((pagePath) => {
	// skip pages starting with an underscore
	if (basename(pagePath)[0] === '_') return;

	var page = require(pagePath);
	var path = page.path;
	var method = page.method || 'get';
	var middleware = page.middleware || [];

	if (!path) throw new Error(`Page ${pagePath} is missing a path.`);
	async function handler (req, res, next) {
		try {
			var initialState = await (page.loadInitialState ? page.loadInitialState(req) : {});
			res.render(page.default, initialState);
		} catch (e) {
			next(e);
		}
	}

	var args = [ path ].concat(middleware, [ handler ]);

	router[method](...args);
	log.debug({ method, path, pagePath }, 'Mounting page');
});

app.use(router);

app.get('/foo', (req, res) => res.send('OK'));

// 404 handler
app.use((req, res, next) => next(boom.notFound('The requested path does not exist')));

app.use(require('./middleware/error-handler'));

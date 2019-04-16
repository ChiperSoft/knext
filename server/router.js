
var { resolve, join, relative } = require('path');
const { existsSync } = require('fs');
const glob  = require('glob');
const log   = require('./log')('server/router');
const renderHtml = require('./render-html');


const React = require('react');
const { renderToStaticMarkup } = require('react-dom/server');
const { HelmetProvider } = require('react-helmet-async');

var manifest = {};
try {
	manifest = require('./rev-manifest.json'); // eslint-disable-line node/no-missing-require
} catch (e) {
	manifest = {};
}

const router = require('express').Router();
module.exports = exports = router;

router.use(function renderer (req, res, next) {
	if (res.render.isReact) return next();

	res.render = function (Page, pageProps, pagePath) {

		const helmetContext = {};
		const App = React.createElement(
			HelmetProvider, { context: helmetContext },
			React.createElement(Page, pageProps)
		);

		const rendered = renderToStaticMarkup(App);

		const html = renderHtml({
			helmet: helmetContext.helmet,
			rendered,
			manifest,
			pageProps,
			pagePath,
		});

		res.send(html);
	};

	res.render.isReact = true;

	return next();
});

const mounted = new Map();
function mountRoute (routeFile) {
	var {
		default: handler,
		path,
		page,
		method = 'all',
		middleware = [],
	} = require(routeFile);

	if (!Array.isArray(method)) method = [ method ];

	if (!path) throw new Error(`Route "${routeFile}" is missing a path.`);

	if (page && !existsSync(resolve( __dirname, '../pages', page ))) {
		throw new Error(`Page path provided for route "${routeFile}" does not exist.`);
	}

	method.forEach((m) => {
		const k = `${path}:${m}`;
		if (mounted.has(k)) {
			throw new Error(
				`Route "${routeFile}" cannot be mounted for ${m} requests, a handler for that method is already mounted at "${path}"`
			);
		}
		mounted.set(k, true);
	});

	async function wrappedHandler (req, res, next) {
		try {
			var result = await handler(req, res);

			// handler wants us to move to the next route
			if (result === false) return next();

			// handler responded on its own
			if (result === true || result === undefined) return;

			// if handler returned a function, we're going to assume it's a React component
			if (typeof result === 'function') {
				res.render(result, {}, page);
				return;
			}

			if (React.isValidElement(result)) {
				res.render(() => result, {}, page);
				return;
			}
		} catch (e) {
			next(e);
		}
	}

	const args = [ path, ...middleware, wrappedHandler ];
	method.forEach((m) => {
		router[m](...args);
	});

	log.debug({ method: method.join(', '), path, page: page && 'pages/' + page, file: relative(__dirname, routeFile) }, 'Mounted page');
}

const routeFiles = glob.sync(join(__dirname, 'routes', '**', '*.js'));
routeFiles.forEach(mountRoute);

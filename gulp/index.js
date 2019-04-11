
const { series, parallel, watch } = require('gulp');
const forever    = require('forever-monitor');
const debounce   = require('lodash/debounce');
const log        = require('fancy-log');

const SERVER_CODE = '+(server|models|pages|routes|components|lib)/**/*.js?(x)';
const CLIENT_CODE = '+(pages|components|webpack)/**/*.js?(x)';
const CSS_MODULES = '+(pages|components)/**/*.?(s)css';
const CSS_MAIN    = [ 'scss/*.scss', '!scss/_*.scss' ];
const DIST        = 'dist';
const DIST_ASSETS = 'dist/public/assets';

const ops = {
	SERVER_CODE,
	CLIENT_CODE,
	CSS_MODULES,
	CSS_MAIN,
	DIST,
	DIST_ASSETS,
};

/** **************************************************************************************************************** **/

const clean = require('./clean')(ops);
exports.clean = clean;

const compileServer = require('./compile-server')(ops);
exports['compile-server'] = compileServer;

const compileCssModules = require('./compile-css-modules')(ops);
exports['compile-css-modules'] = compileCssModules;

const compileClient = require('./compile-client')(ops);
exports['compile-client'] = compileClient;

const compileSiteCss = require('./compile-css-main')(ops);
exports['compile-site-css'] = compileSiteCss;

const cachebust = require('./cachebust')(ops);
exports.cachebust = cachebust;

const compileDev = parallel(
	compileServer,
	compileCssModules,
	compileClient,
	compileSiteCss
);
exports.dev = compileDev;

const compileProd = series(
	parallel(
		compileServer,
		compileCssModules,
		compileClient.prod,
		compileSiteCss.prod,
	),
	cachebust
);
exports.prod = compileProd;

/** **************************************************************************************************************** **/


function server () {
	var srv = new forever.Monitor('./www.js', {
		max: 1,
		env: {  },
		watch: false,
	});

	srv.on('exit', () => {
		log.error('Server has crashed');
	});

	var reload = debounce((cb) => {
		srv.restart();
		if (cb) cb();
	}, 500);

	srv.start();

	return reload;
};

function watcher () {
	const reload = server();

	watch(SERVER_CODE, series(
		compileServer,
		reload
	));

	watch([ '+(pages|components)/**/*.?(s)css', 'scss/_variables.scss', 'scss/_mixins.scss' ], series(
		parallel(
			compileCssModules,
			compileClient
		),
		reload
	));

	watch([ 'scss/_variables.scss', 'scss/_mixins.scss' ], parallel(
		compileCssModules,
		compileClient
	));

	watch('scss/**/*.?(s)css', compileSiteCss);

	watch(CLIENT_CODE, compileClient);
};

exports.default = series(clean, compileDev);
exports.watch = series(clean, compileDev, watcher);
exports.uat = series(clean, compileProd, server);
exports.build = series(clean, compileProd);

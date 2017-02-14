'use strict';

var gulp       = require('gulp');
var gutil      = require('gulp-util');
var cache      = require('gulp-cached');
var babel      = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var postcss    = require('gulp-postcss');
var filter     = require('gulp-filter');
var concat     = require('gulp-concat');
var sass       = require('gulp-sass');
var modules    = require('postcss-modules');
var autoprefixer = require('autoprefixer');
var rename     = require('gulp-rename');

var through    = require('through2');
var webpack    = require('webpack');
var debounce   = require('lodash/debounce');
var forever    = require('forever-monitor');
var del        = require('del');
var Path       = require('path');

var webpackConfig = require('./webpack.js');

var debug = require('through2').obj(function (file, enc, next) { // eslint-disable-line no-unused-vars
	var details = Object.assign({ path: file.path, relative: file.relative }, file);
	console.log(details); // eslint-disable-line
	this.push(file);
	next();
});

const SERVER_CODE = '+(server|pages|routes|components|lib)/**/*.js?(x)';
const CLIENT_CODE = '+(pages|components|webpack)/**/*.js?(x)';
const CSS_MODULES = '+(pages|components|scss)/**/*.?(s)css';
const CSS_MAIN    = '+(scss)/**/*.?(s)css';

module.exports = exports = {

	clean () {
		return del([ 'dist' ]);
	},

	compileServer () {
		return gulp.src(SERVER_CODE)
			.pipe(cache('babel'))
			.pipe(sourcemaps.init())
			.pipe(babel())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest('dist'));
	},

	compileClient (callback) {
		webpack(webpackConfig, (err, stats) => { // eslint-disable-line no-unused-vars
			if (err) throw new gutil.PluginError('webpack', err);
			// gutil.log('[webpack]', stats.toString());
			callback();
		});
	},

	compileCssMain () {
		return gulp.src('scss/main.scss')
			.pipe(sass().on('error', sass.logError))
			.pipe(postcss([
				autoprefixer({
					browsers: [ 'last 2 versions' ],
				}),
			]))
			.pipe(gulp.dest('dist/public/assets'));
	},

	compileCssModules () {
		// postcss-modules exports the JSON data via a callback, since postcss is
		// a one to one input/output operation.  We have to save this output so
		// that it can be injected back into the gulp stream.
		// We push these onto an array so that if something fires out of sequence
		// the files wont get lost.
		var pending = [];
		function getJSONFromCssModules (cssFileName, json) {
			pending.push({
				path: cssFileName + '.json',
				contents: Buffer.from(JSON.stringify(json, null, 2)),
			});
		}

		var fcss = filter('**/*.css');
		var fjson = filter('**/*.json', { restore: true });

		// our modules are located in component folders inside shared
		// ex: source/shared/components/header/styles.css
		return gulp.src('+(pages|components)/**/*.?(s)css')

			// setup sourcemap processing
			.pipe(sourcemaps.init())

			.pipe(sass().on('error', sass.logError))

			// This is the meat of the css module processing.
			// We pass in our callback from above to capture json output
			.pipe(postcss([
				modules({
					getJSON: getJSONFromCssModules,
					scopeBehaviour: 'global',
				}),
				autoprefixer({
					browsers: [ 'last 2 versions' ],
				}),
			]))

			// Write out the sourcemap info to the file.
			.pipe(sourcemaps.write())

			// As files come out of the postcss gulp workflow, the pending
			// array contains the json file.  Here we use through2 to inject
			// those files into the gulp stream with the same path details.
			.pipe(through.obj(function (file, enc, next) {
				var push = this.push.bind(this);

				// pushing out a clone so that the object doesn't get changed
				// by later pipeline steps
				push(file.clone());

				pending.forEach((item) => {
					push(new gutil.File({
						cwd: file.cwd,
						base: file.base,
						path: item.path,
						contents: item.contents,
					}));
				});
				pending = [];
				next();
			}))

			// save out the compiled css and the json file
			.pipe(fjson)
			.pipe(rename((path) => {
				var ext = Path.extname(path.basename);
				if (ext !== '.css') return;
				var bn = Path.basename(path.basename, ext);
				path.basename = `${bn}.scss`;
			}))
			.pipe(gulp.dest('dist'))
			.pipe(fjson.restore)

			// filter out everything except the css and concat it into a single
			// modules file that will be hosted publicly.
			.pipe(fcss)
			.pipe(concat('modules.css'))
			.pipe(gulp.dest('dist/public/assets'));
	},

	copyModels () {
		return gulp.src('models/**/*.js')
			.pipe(gulp.dest('dist/models'));
	},

	launch () {
		var server = new forever.Monitor('./www.js', {
			max: 1,
			env: {  },
			watch: false,
		});

		server.on('exit', () => {
			console.log('Server has crashed'); // eslint-disable-line
		});

		var reload = debounce(() => { server.restart(); }, 500);

		gulp.watch(SERVER_CODE, gulp.series(
			exports.compileServer,
			(done) => { reload(); done(); }
		));

		gulp.watch('+(pages|components|scss)/**/*.?(s)css', gulp.series(
			exports.compileCssModules,
			exports.compileClient,
			(done) => { reload(); done(); }
		));

		gulp.watch(CLIENT_CODE, exports.compileClient);
		gulp.watch(CSS_MAIN, exports.compileCssMain);

		server.start();
	},

};

exports.build = gulp.series(
	exports.clean,
	gulp.parallel(
		exports.compileCssMain,
		exports.compileCssModules
	),
	gulp.parallel(
		exports.compileServer,
		exports.copyModels,
		exports.compileClient
	)
);

gulp.task('default', gulp.parallel(
	exports.build
));

gulp.task('watch', gulp.series(exports.build, exports.launch));

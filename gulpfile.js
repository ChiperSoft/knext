'use strict';

var gulp       = require('gulp');
var cache      = require('gulp-cached');
var babel      = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var webpack    = require('webpack');
var debounce   = require('lodash/debounce');
var forever    = require('forever-monitor');
var del        = require('del');
var gutil      = require('gulp-util');

var webpackConfig = require('./webpack.js');

var debug = require('through2').obj(function (file, enc, next) { // eslint-disable-line no-unused-vars
	var details = Object.assign({ path: file.path, relative: file.relative }, file);
	console.log(details); // eslint-disable-line
	this.push(file);
	next();
});

const SERVER_CODE = '+(server|pages|routes|components|lib)/**/*.js?(x)';
const CLIENT_CODE = '+(pages|components|webpack)/**/*.js?(x)';

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

		gulp.watch(CLIENT_CODE, gulp.series(
			exports.compileClient,
			(done) => { reload(); done(); }
		));

		server.start();
	},

};

exports.build = gulp.series(
	exports.clean,
	gulp.parallel(exports.compileServer, exports.copyModels, exports.compileClient)
);

gulp.task('default', gulp.parallel(
	exports.build
));

gulp.task('watch', gulp.series(exports.build, exports.launch));

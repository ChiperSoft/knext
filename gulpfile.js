'use strict';

var gulp       = require('gulp');
var cache      = require('gulp-cached');
var babel      = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var debounce   = require('lodash/debounce');
var forever    = require('forever-monitor');
var del        = require('del');


var debug = require('through2').obj(function (file, enc, next) { // eslint-disable-line no-unused-vars
	var details = Object.assign({ path: file.path, relative: file.relative }, file);
	console.log(details); // eslint-disable-line
	this.push(file);
	next();
});

const JSX_CODE = '+(server|pages|components)/**/*.js?(x)';

module.exports = exports = {

	clean () {
		return del([ 'dist' ]);
	},

	compileServer () {
		return gulp.src(JSX_CODE)
			.pipe(cache('babel'))
			.pipe(sourcemaps.init())
			.pipe(babel())
			.pipe(sourcemaps.write())
			.pipe(gulp.dest('dist'));
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

		gulp.watch(JSX_CODE, gulp.series(
			exports.compileServer,
			(done) => { reload(); done(); }
		));

		server.start();
	},

};

exports.build = gulp.series(
	exports.clean,
	gulp.parallel(exports.compileServer, exports.copyModels)
);

gulp.task('default', gulp.parallel(
	exports.build
));

gulp.task('watch', gulp.series(exports.build, exports.launch));

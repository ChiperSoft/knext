
const { src, dest }    = require('gulp');
const cache      = require('gulp-cached');
const sourcemaps = require('gulp-sourcemaps');
const babel      = require('gulp-babel');


module.exports = exports = ({ SERVER_CODE, DIST }) =>
	function compileServer () {
		return src(SERVER_CODE)
			.pipe(cache('babel'))
			.pipe(sourcemaps.init())
			.pipe(babel())
			.pipe(sourcemaps.write())
			.pipe(dest(DIST));
	}
;

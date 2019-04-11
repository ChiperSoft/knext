
const { src, dest } = require('gulp');
// const cache         = require('gulp-cached');
const sass          = require('gulp-sass');
const sourcemaps    = require('gulp-sourcemaps');
const postcss       = require('gulp-postcss');
const autoprefixer  = require('autoprefixer');
const { resolve }      = require('path');
const crass         = require('./lib/crass');


module.exports = exports = ({ CSS_MAIN, DIST_ASSETS }) => {
	function compileCssMain () {
		return src(CSS_MAIN)

			.pipe(sourcemaps.init())
			.pipe(sass({
				includePaths: [ resolve(__dirname, '../node_modules') ],
			}).on('error', sass.logError))

			.pipe(postcss([
				autoprefixer(),
			]))
			.pipe(sourcemaps.write())

			.pipe(dest(DIST_ASSETS))
		;
	}

	compileCssMain.prod = function compileCssMainForProd () {
		return src(CSS_MAIN)

			.pipe(sass({
				includePaths: [ resolve(__dirname, '../node_modules') ],
			}).on('error', sass.logError))

			.pipe(postcss([
				autoprefixer(),
			]))

			.pipe(crass())

			.pipe(dest(DIST_ASSETS))
		;
	};

	return compileCssMain;
};


const { resolve } = require('path');
const { src, dest } = require('gulp');
const cache         = require('gulp-cached');
const sass          = require('gulp-sass');
const concat        = require('gulp-concat');
const Vinyl         = require('vinyl');
const filter        = require('gulp-filter');
const postcss       = require('gulp-postcss');
const modules       = require('postcss-modules');
const autoprefixer  = require('autoprefixer');
const gap           = require('gulp-append-prepend');
const through       = require('./lib/through');
const merge         = require('merge-stream');

module.exports = exports = ({ CSS_MODULES, DIST, DIST_ASSETS }) =>
	function compileCssModules () {
		// postcss-modules exports the JSON data via a callback, since postcss is
		// a one to one input/output operation.  We have to save this output so
		// that it can be injected back into the gulp stream.
		// We push these onto an array so that if something fires out of sequence
		// the files wont get lost.
		var pending = [];
		function getJSONFromCssModules (cssFileName, json) {
			pending.push({
				path: cssFileName.replace(/\.css$/, '.scss') + '.json',
				contents: Buffer.from(JSON.stringify(json, null, 2)),
			});
		}

		// our modules are located in component folders inside shared
		// ex: source/shared/components/header/styles.css
		const moduleStream = src(CSS_MODULES)
			.pipe(cache('css-modules'))

			.pipe(gap.prependText(`
				@import "scss/mixins";
				@import "scss/variables";
			`))

			.pipe(sass({
				includePaths: [
					resolve(__dirname, '../node_modules'),
					resolve(__dirname, '../scss'),
				],
			}).on('error', sass.logError))

			// This is the meat of the css module processing.
			// We pass in our callback from above to capture json output
			.pipe(postcss([
				modules({
					getJSON: getJSONFromCssModules,
					scopeBehaviour: 'global',
					generateScopedName: '[path][name]--[local]',
				}),
				autoprefixer(),
			]))

			// As files come out of the postcss gulp workflow, the pending
			// array contains the matching json file.  Here we use through2 to inject
			// those files into the gulp stream with the same path details.
			.pipe(through(async (stream, file) => {
				// pushing out a clone so that the object doesn't get changed
				// by later pipeline steps
				stream.push(file.clone());

				pending.forEach((item) => {
					stream.push(new Vinyl({
						cwd: file.cwd,
						base: file.base,
						path: item.path,
						contents: item.contents,
					}));
				});
				pending = [];
			}));

		const jsonStream = moduleStream
			.pipe(filter((file) => (/\.json$/).test(file.path)))
			.pipe(dest(DIST))
		;

		const cssStream = moduleStream
			.pipe(filter((file) => (/\.css$/).test(file.path)))
			.pipe(concat('modules.css'))
			.pipe(dest(DIST_ASSETS))
		;

		return merge(
			jsonStream
			, cssStream
		);
	}
;

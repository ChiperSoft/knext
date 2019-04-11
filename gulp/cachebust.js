
const { join, basename, dirname }      = require('path');
const { src, dest } = require('gulp');
const rev           = require('gulp-rev');
const through       = require('./lib/through');

module.exports = exports = ({ DIST }) =>
	function cachebusting () {
		return src([ `${DIST}/public/**/*.+(css|js)`, `!${DIST}/public/**/rev*.+(css|js)` ])
			.pipe(rev())
			.pipe(through(async (stream, file) => {
				// Rewriting the rev filename to something we can select against to ignore
				const name = basename(file.revOrigPath);
				const dir = dirname(file.path);
				file.path = join(dir, `rev-${file.revHash}-${name}`);

				stream.push(file);
			}))

			// have to write out to public root because /assets is appended to all file urls.
			.pipe(dest(`${DIST}/public`))

			// manifest can be saved normally
			.pipe(rev.manifest())
			.pipe(dest(join(DIST, 'server')));
	}
;

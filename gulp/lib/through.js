
var through = require('through2');

module.exports = exports = function asyncthrough (...args) {
	const [ fn, donefn ] = args;

	args[0] = async function (file, enc, next) {
		try {
			await fn(this, file, enc);
			next();
		} catch (err) {
			next(err);
		}
	};

	if (donefn) {
		args[1] = async function (next) {
			try {
				await donefn(this);
				next();
			} catch (err) {
				next(err);
			}
		};
	}

	return through.obj(...args);
};

/* eslint no-shadow:0 */

var logger  = require('../log');
var boom    = require('boom');
var ErrorPage = require('../../pages/_error').default;

module.exports = exports = function errorHandler (err, req, res, next) { // eslint-disable-line no-unused-vars

	if (!err.isBoom) {
		req.log.error(err);
		err = boom.boomify(err, {
			statusCode: !res.statusCode || res.statusCode < 400 ? 500 : res.statusCode,
			message: err.message,
		});
	}

	logger.errorHandler()(err, req, res, (err) => {
		var payload = err.output.payload;

		if (err.output.headers) {
			res.set(err.output.headers);
		}

		res.status(err.output.statusCode);

		res.render(ErrorPage, {
			errors: [ {
				title: payload.error,
				detail: payload.message,
				stack: process.env.NODE_ENV === 'production' ? undefined : err.stack && err.stack.split('\n'),
			} ],
		});
	});

};

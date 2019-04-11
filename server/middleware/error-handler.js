
var logger  = require('../log');
var boom    = require('boom');
var ErrorPage = require('../../pages/_error').default;
var NotFound  = require('../../pages/_notfound').default;

module.exports = exports = (name) => function errorHandler (err, req, res, next) { // eslint-disable-line no-unused-vars
	var log = logger(name || 'express');

	if (!err.isBoom) {
		log.error(err);
		err = boom.boomify(err, {
			statusCode: !res.statusCode || res.statusCode < 400 ? 500 : res.statusCode,
			message: err.message,
		});
	}

	var payload = err.output.payload;

	if (err.output.headers) {
		res.set(err.output.headers);
	}

	res.status(err.output.statusCode);

	if (err.output.statusCode === 404) {
		if (res.render.isReact) {
			res.render(NotFound, {});
		} else {
			res.type('text/text');
			res.send('Not Found: The requested path does not exist.');
		}
		return;
	}

	if (res.render.isReact) {
		res.render(ErrorPage, {
			errors: [ {
				title: payload.error,
				detail: payload.message,
				stack: process.env.NODE_ENV === 'production' ? undefined : err.stack && err.stack.split('\n'),
			} ],
		});
	} else {
		res.type('text/text');
		res.send(`
			${payload.error}
			${process.env.NODE_ENV === 'production' ? undefined : err.stack && err.stack.split('\n')}
		`);
	}
};

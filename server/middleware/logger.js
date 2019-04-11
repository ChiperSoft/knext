
var logger  = require('../log');
var morgan = require('morgan');
var bytes  = require('bytes');

module.exports = exports = function (name) {
	var log = logger(name || 'express');

	return morgan((tokens, req, res) => {
		var len = Number(res.getHeader('Content-Length'));
		len = isNaN(len) ? '' : ' ' + bytes(len);

		return log.info({
			method: tokens.method(req, res),
			status: tokens.status(req, res),
			address: req.headers['x-forwarded-for'] || tokens['remote-addr'](req, res),
			url: tokens.url(req, res),
			duration: (new Date - req._startTime),
			length: len,
		});
	});
};

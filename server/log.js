
var bunyan = require('bunyan');
var config = require('config');

module.exports = exports = function (name, options) {
	return bunyan.createLogger({
		level: process.env.LOG_LEVEL || config.logLevel || 'debug',
		name: config.name + '/' + name,
		serializers: {
			...bunyan.stdSerializers,
		},
		src: !!process.env.LOG_TRACE,
		...options,
	});
};

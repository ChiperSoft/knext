#!/usr/bin/env node

require('source-map-support').install();

var pkg = require('./package.json');
var config    = require('config');
Object.assign(process.env, config.env);

config.name = pkg.name;
config.version = pkg.version;
config.isProd = process.env.NODE_ENV === 'production';
config.logLevel = process.env.LOG_LEVEL || config.logLevel;

if (!config.isProd) {
	process.env.BLUEBIRD_DEBUG = true;
	process.env.BLUEBIRD_LONG_STACK_TRACES = true;
}

var log     = require('./dist/server/log')('www');
var app     = require('./dist/server/index');

var http      = require('http');
var Promise   = require('bluebird');

log.info(`Current environment is "${process.env.NODE_ENV || 'local'}"`);

if (config.isProd) {
	log.info(config, 'Current configuration');
}

var server = http.createServer(app);
server.listen(config.port, config.bind, () => {
	log.info(`Express server listening at http://${config.bind}:${config.port}`);
});

var terminating = false;
var shutdown = function () {
	if (terminating) return;
	terminating = true;
	log.warn('Process is terminating, stopping server and finishing requests');
	server.close(function serverClosed () {
		log.info('Server halted');

		var promises = [];
		process.emit('graceful stop', promises);

		Promise.all(promises).finally(() => {
			log.warn('Shutdown');
			process.exit(0); // eslint-disable-line no-process-exit
		});
	});

	setTimeout(() => {
		log.error('Shutdown took too long, terminating.');
		process.exit(0); // eslint-disable-line no-process-exit
	}, 2000);
};

process.on('SIGUSR2', shutdown);
process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
process.graceful = shutdown;

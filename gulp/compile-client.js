/* eslint promise/no-native: 0 */
const PluginError   = require('plugin-error');
const webpack       = require('webpack');
const webpackConfig = require('../webpack');
const log           = require('fancy-log');
const filter        = require('lodash/filter');

module.exports = exports = () => {

	function runWebpack (env) {
		return new Promise((resolve, reject) => {
			webpack(webpackConfig(env), (err, stats) => {
				if (err) {
					log.error(err.stack || err);
					if (err.details) {
						log.error(err.details);
					}
					return reject(new PluginError('webpack', 'Webpack encountered errors while compiling.'));
				}

				const info = stats.toJson();

				if (stats.hasErrors()) {
					info.errors.forEach(log.error);
					return reject(new PluginError('webpack', 'Webpack encountered errors while compiling.'));
				}

				if (stats.hasWarnings()) {
					log.warn('WARNINGS', info.warnings);
				}

				resolve();
			});
		});
	}

	function compileClient () {
		return runWebpack('development');
	}

	compileClient.prod = function compileClientForProd () {
		return runWebpack('production');
	};

	compileClient.watch = function compileClientAndWatch () {
		const compiler = webpack(webpackConfig('development'));
		return compiler.watch({
			aggregateTimeout: 300,
			logger: log,
		}, (err, stats) => {
			if (err) {
				log.error(err.stack || err);
				if (err.details) {
					log.error(err.details);
				}
			}

			const info = stats.toJson();

			if (stats.hasErrors()) {
				info.errors.forEach(log.error);
			}

			if (stats.hasWarnings()) {
				log.warn('WARNINGS', info.warnings);
			}

			const built = filter(info.assets, 'emitted').map((a) => a.name)
			log.info(`Finished 'compileClient' after ${info.time} ms\n  ${built.join('\n  ')}`);
		});
	};

	return compileClient;
};


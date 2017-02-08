'use strict';

const allModules = {
	'react': () => require('react'),
	'react-dom': () => require('react-dom'),
};

require.context('../pages', true, /^pages\//);

module.exports = exports = function externalRequire (modules, cb) {
	const pModules = modules.map((x) => {
		if (allModules[x]) return Promise.resolve(allModules[x]);

		return import(x);
	});

	Promise.all(pModules).then((loaded) => cb.apply(null, loaded));
};

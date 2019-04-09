
module.exports = exports = (api) => {
	if (api && api.cache) api.cache(true);

	return {
		compact: false,
		sourceMaps: 'inline',
		presets: [
			[
				'@babel/preset-env',
				{
					modules: 'commonjs',
					targets: { node: true },
				},
			],
			'@babel/preset-react',
		],
		plugins: [
			'@babel/plugin-proposal-class-properties',
			'@babel/plugin-syntax-dynamic-import',
		],
		env: {
			production: {
				plugins: [
					'lodash',
					'transform-react-remove-prop-types',
					'@babel/plugin-transform-react-inline-elements',
					'@babel/plugin-transform-react-constant-elements',
				],
			},
			test: {
				plugins: [
					'@babel/plugin-transform-modules-commonjs',
					'dynamic-import-node',
				],
			},
		},
	};
};

exports.clientSide = {
	compact: true,
	sourceMaps: 'inline',
	presets: [
		[
			'@babel/preset-env',
			{
				modules: 'commonjs',
				useBuiltIns: 'entry',
				corejs: 3,
			},
		],
		'@babel/preset-react',
	],
	plugins: [
		'@babel/plugin-proposal-class-properties',
		'@babel/plugin-syntax-dynamic-import',
	],
	env: {
		production: {
			plugins: [
				'lodash',
				'transform-react-remove-prop-types',
				'@babel/plugin-transform-react-inline-elements',
				'@babel/plugin-transform-react-constant-elements',
			],
		},
		test: {
			plugins: [
				'@babel/plugin-transform-modules-commonjs',
				'dynamic-import-node',
			],
		},
	},
};

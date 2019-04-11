'use strict';

const webpack = require('webpack');
const { join: pathJoin, resolve: pathResolve, basename } = require('path');
const glob = require('glob');

// We're using crass for css minification. This function hooks into
// optimize-css-assets-webpack-plugin to override its use of cssnano
const crass = require('crass');
const crassProcessor = {
	process: async (input, options) => {
		options = { o1: true, pretty: false, ...options };
		var parsed = crass.parse(input);
		parsed = parsed.optimize({ O1: !!options.o1 });
		if (options.pretty) parsed = parsed.pretty();
		return { css: parsed.toString() };
	},
};


const LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const TerserJSPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');

const babelConfig = require('./babel.config.js').clientSide;

const pages = glob.sync('pages/**/*.jsx', { cwd: __dirname });
const entry = {};
const cacheGroups = {};
for (const p of pages) {
	// skip anything starting with an underscore, as those are server side only pages
	if (basename(p)[0] === '_') continue;
	entry[p.replace('.jsx', '')] = `./webpack/page!${pathJoin('.', p)}`;
}

cacheGroups.vendor = {
	test: /node_modules/,
	chunks: 'all',
	name: 'vendor',
	filename: 'vendor.js',
	enforce: true,
};

module.exports = exports = function (env) {
	var mode;
	switch (env) {
	case 'prod':
	case 'production':
	case 'uat':
		mode = 'production';
		break;

	case 'dev':
	case 'development':
	case 'local':
	default:
		mode = 'development';
	}

	var isProd = mode === 'production';

	/** Define Loader Configs ************************************************************************************* **/

	const cssModuleLoader = {
		loader: 'css-loader',
		options: {
			importLoaders: 2,
			sourceMap: true,
			modules: 'global',
			localIdentName: '[path][name]--[local]',
		},
	};

	const postCssLoader = {
		loader: 'postcss-loader',
		options: {
			sourceMap: 'inline',
			plugins: () => [
				require('autoprefixer'),
			],
		},
	};

	const sassLoader = {
		loader: 'sass-loader',
		options: {
			includePaths: [
				pathJoin(__dirname, 'node_modules'),
				pathJoin(__dirname, 'scss'),
			],
			data: `
				@import "scss/mixins";
				@import "scss/variables";
			`,
		},
	};

	/** Setup Loader Rulesets ************************************************************************************* **/

	var rules = [];

	rules.push({
		test: /\.jsx?$/,
		resolve: {
			extensions: [ '.js', '.jsx', '.json' ],
		},
		use: [
			{
				loader: 'babel-loader',
				options: babelConfig,
			},
		],
	});

	rules.push({
		test: /\.css$/,
		use: [
			MiniCssExtractPlugin.loader,
			'css-loader',
		],
	});

	rules.push({
		test: /\.scss$/,
		use: [
			MiniCssExtractPlugin.loader,
			cssModuleLoader,
			postCssLoader,
			sassLoader,
		],
	});

	const plugins = [
		new LodashModuleReplacementPlugin({
			collections: true,
			paths: true,
		}),
		new webpack.DefinePlugin({
			'process.env.NODE_ENV': mode,
			'process.env.BUILD_DATE': JSON.stringify(new Date()),
		}),
		new MiniCssExtractPlugin(),
	];

	/** Generate Final Config ************************************************************************************* **/

	const config = {
		mode,
		entry,
		plugins,
		output: {
			path: pathResolve(__dirname, 'dist', 'public', 'assets'),
			filename: '[name].js',
			libraryTarget: 'var',
		},
		resolve: {
			modules: [
				__dirname,
				pathJoin(__dirname, 'node_modules'),
			],
		},
		module: { rules },
		optimization: {
			runtimeChunk: { name: 'runtime' },
			splitChunks: {
				chunks: 'all',
				maxInitialRequests: Infinity,
				minSize: 0,
				cacheGroups,
			},
			minimize: isProd,
			minimizer: [
				new TerserJSPlugin({
					terserOptions: {
						warnings: false,
						compress: {
							comparisons: false,
						},
						parse: {},
						mangle: true,
						output: {
							comments: false,
							ascii_only: true,
						},
					},
					parallel: true,
					cache: true,
					sourceMap: true,
				}),
				new OptimizeCSSAssetsPlugin({
					cssProcessor: crassProcessor,
				}),
			],
		},
	};

	return config;
};

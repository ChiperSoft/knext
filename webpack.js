'use strict';

var webpack = require('webpack');
var { join: pathJoin, resolve: pathResolve, basename } = require('path');
var glob = require('glob');

var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var babelConfig = require('./babel.config.js').clientSide;

function recursiveIssuer (m) {
	if (m.issuer) {
		return recursiveIssuer(m.issuer);
	}
	if (m.name) {
		return m.name;
	}
	return false;
}

var pages = glob.sync(pathJoin('pages', '**', '*.jsx'), { cwd: __dirname });
const entry = {};
const cacheGroups = {};
for (const p of pages) {
	entry[p.replace('.jsx', '.js')] = `./webpack/page!${pathJoin('.', p)}`;
	cacheGroups[p] = {
		filename: basename(p).replace('.jsx', '.css'),
		name: p,
		test: (m, c, entryName = p) => m.constructor.name === 'CssModule' && recursiveIssuer(m) === entryName,
		chunks: 'all',
		enforce: true,
	};
}

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

	const { plugins, output, resolve, module } = exports;

	const config = {
		mode,
		entry,
		plugins,
		output,
		resolve,
		module,
		optimization: {
			splitChunks: {
				cacheGroups,
			},
		},
	};

	// console.log(config.optimization.splitChunks);

	return config;
};

exports.plugins = [
	new LodashModuleReplacementPlugin({
		collections: true,
		paths: true,
	}),
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify('production'),
	}),
	new MiniCssExtractPlugin(),
];

exports.output = {
	path: pathResolve(__dirname, 'dist', 'public', 'assets'),
	filename: '[name]',
	libraryTarget: 'var',
};

exports.resolve = {
	modules: [
		__dirname,
		pathJoin(__dirname, 'node_modules'),
	],
};

exports.module = {
	rules: [
		{
			test: /\.css$/,
			use: [
				MiniCssExtractPlugin.loader,
				'css-loader',
			],
		},
		{
			test: /\.scss$/,
			use: [

				MiniCssExtractPlugin.loader,
				// {
				// 	loader: pathJoin(__dirname, 'webpack/debug-loader'),
				// },
				{
					loader: 'css-loader',
					options: {
						importLoaders: 2,
						sourceMap: true,
						modules: 'global',
						localIdentName: '[path][name]--[local]',
					},
				},
				{
					loader: 'postcss-loader',
					options: {
						sourceMap: 'inline',
						plugins: () => [
							require('autoprefixer'),
						],
					},
				},
				{
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
				},
			],
		},
		{
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
		},
	],
};

'use strict';

var webpack = require('webpack');
var { join: pathJoin, resolve: pathResolve } = require('path');
var glob = require('glob');

var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

var babelConfig = require('./babel.config.js').clientSide;

var pages = glob.sync(pathJoin('pages', '**', '*.jsx'), { cwd: __dirname });
const entry = {};
const cacheGroups = {};
for (const p of pages) {
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

	const { plugins, output, resolve, module } = exports;

	const config = {
		mode,
		entry,
		plugins,
		output,
		resolve,
		module,
		optimization: {
			runtimeChunk: { name: 'runtime' },
			splitChunks: {
				chunks: 'all',
				maxInitialRequests: Infinity,
				minSize: 0,
				cacheGroups,
			},
		},
	};

	return config;
};

exports.plugins = [
	new LodashModuleReplacementPlugin({
		collections: true,
		paths: true,
	}),
	new webpack.DefinePlugin({
		'process.env.BUILD_DATE': JSON.stringify(new Date()),
	}),
	new MiniCssExtractPlugin(),
];

exports.output = {
	path: pathResolve(__dirname, 'dist', 'public', 'assets'),
	filename: '[name].js',
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

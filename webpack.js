'use strict';

var webpack = require('webpack');
var pathLib = require('path');
var joinpath = pathLib.join;
var resolve = pathLib.resolve;
var glob = require('glob');
var fs = require('fs');

var LodashModuleReplacementPlugin = require('lodash-webpack-plugin');
var ExtractTextPlugin = require('extract-text-webpack-plugin');

var babelConfig = JSON.parse(fs.readFileSync(resolve(__dirname, '.babelrc'), 'utf8'));

babelConfig.plugins.pop(); // pop off transform-es2015-modules-commonjs

var pages = glob.sync(joinpath('pages', '**', '*.jsx'), { cwd: __dirname });

exports.entry = {};

for (const p of pages) {
	exports.entry[p.replace('.jsx', '.js')] = `./webpack/page!${joinpath('.', p)}`;
}

exports.plugins = [
	new LodashModuleReplacementPlugin({
		collections: true,
		paths: true,
		currying: true,
	}),
	new webpack.DefinePlugin({
		'process.env.NODE_ENV': JSON.stringify('production'),
	}),
	new webpack.optimize.CommonsChunkPlugin({ name: 'vendor', filename: 'vendor.js' }),
	new webpack.optimize.OccurrenceOrderPlugin(),
	new ExtractTextPlugin('[name].css'),
];

exports.output = {
	path: resolve(__dirname, 'dist', 'public', 'assets'),
	filename: '[name]',
	libraryTarget: 'var',
};

exports.resolve = {
	modules: [
		__dirname,
		joinpath(__dirname, 'node_modules'),
	],
};

exports.module = {
	rules: [
		{
			test: /\.css$/,
			loader: ExtractTextPlugin.extract({ fallback: 'style-loader', use: 'css-loader' }),
		},
		{
			test: /\.scss$/,
			loader: ExtractTextPlugin.extract({
				fallback: 'style-loader',
				use: [
					{
						loader: 'css-loader',
						options: {
							importLoaders: 1,
							sourceMap: 'inline',
							modules: false,
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
					},
				],
			}),
		},
		{
			test: /\.jsx?$/,
			loader: 'babel-loader',
			options: babelConfig,
		},
	],
};

import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Html from './html';

var manifest = {};

try {
	manifest = require('./rev-manifest.json'); // eslint-disable-line node/no-missing-require
} catch (e) {
	manifest = {};
}

function assets (path) {
	if (path[0] === '/') path = path.substr(1);

	var lookup = 'rev/' + path;

	if (manifest[lookup]) return '/' + manifest[lookup];
	return '/' + path;
};

export function renderer (req, res, next) {
	if (res.render.isReact) return next();

	res.render = function (Page, store, pagePath) {
		const node = (
			<Html assets={assets} initialState={store} pagePath={pagePath}>
				<Page {...store} />
			</Html>
		);

		var html = '<!DOCTYPE html>' + renderToStaticMarkup(node);
		res.send(html);
	};
	res.render.isReact = true;

	return next();
};

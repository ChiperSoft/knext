
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import Html from './html';

function assets (path) {
	return path; // TODO: Make this use a cachebuster file
};

export function renderer (req, res, next) {
	if (res.render.isReact) return next();

	res.render = function (Page, store) {
		var html = '<!DOCTYPE html>' + renderToStaticMarkup(
			<Html assets={assets} initialState={store}>
				<Page {...store} />
			</Html>
		);
		res.send(html);
	};
	res.render.isReact = true;

	return next();
};

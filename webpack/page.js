
module.exports = exports = function () {};

exports.pitch = function (remainingRequest) {
	return `
		import React from 'react';
		import { render } from 'react-dom';
		import Page from ${JSON.stringify(remainingRequest)};
		const { HelmetProvider } = require('react-helmet-async');

		var pageProps = window.__PAGE_PROPS__;
		window.__PAGE_PROPS__ = null;

		const node = React.createElement(
			HelmetProvider, {},
			React.createElement(Page, pageProps)
		);

		render(node, document.getElementById('root'));
	`;
};

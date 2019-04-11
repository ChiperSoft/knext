
module.exports = exports = function () {};

exports.pitch = function (remainingRequest) {
	return `
	import React from 'react';
	import { render } from 'react-dom';
	import Page from ${JSON.stringify(remainingRequest)};

	var store = window.__PAGE_PROPS__;
	window.__PAGE_PROPS__ = null;

	render(React.createElement(Page, store), document.getElementById('root'));
	`;
};

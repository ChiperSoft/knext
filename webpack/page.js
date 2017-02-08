
module.exports = exports = function () {};

exports.pitch = function (remainingRequest) {
	return `
	var React = require('react');
	var render = require('react-dom').render;
	var Page = require(${JSON.stringify(remainingRequest)}).default;

	var store = window.__INITIAL_STATE__;
	window.__INITIAL_STATE__ = null;

	render(React.createElement(Page, store), document.getElementById('root'));
	`;
};

/* eslint react/prefer-stateless-function:0 */

import React, { Component, PropTypes, Children } from 'react';
import Helmet from 'react-helmet';

export default class Html extends Component {
	static propTypes = {
		assets:       PropTypes.function,
		initialState: PropTypes.object, // eslint-disable-line react/forbid-prop-types
		pagePath:     PropTypes.string,
		children:     PropTypes.element.isRequired,
	};

	render () {
		const { assets, initialState, children } = this.props;

		var head  = Helmet.rewind();
		var meta  = head.meta.toComponent();
		var title = head.title.toComponent();
		var link  = head.link.toComponent();

		return (
			<html lang="en-us">
				<head>
					<link rel="stylesheet" href="https://maxcdn.bootstrapcdn.com/bootstrap/latest/css/bootstrap.min.css" />
					{/* <link rel="stylesheet" href={assets('/build/style.css')} /> */}
					{title}{meta}{link}
				</head>
				<body>
					{/* Content div where the client-side will take over the loading from the server */}
					<div id="root">{Children.only(children)}</div>

					{/* Inject the state from the server to the client to take over */}
					<script
						dangerouslySetInnerHTML={{ __html: `window.__INITIAL_STATE__=${JSON.stringify(initialState)};` }}
						charSet="UTF-8"
					/>

					<script src={assets('/assets/vendor.js')} charSet="UTF-8" />
					<script src={assets('/assets/externalRequire.js')} charSet="UTF-8" />
					this.props.pagePath && <script src={assets('/assets/' + this.props.pagePath)} charSet="UTF-8" />

					<script
						dangerouslySetInnerHTML={{ __html: `
							externalRequire(['react', 'react-dom', '${this.props.pagePath}'], function (React, render, Page) {
								var store = window.__INITIAL_STATE__;
								window.__INITIAL_STATE__ = null;

								render(React.createElement(Page, store), document.getElementById('body'));
							});
						`}}
						charSet="UTF-8"
					/>
				</body>
			</html>
		);
	}
};

/* eslint react/prefer-stateless-function:0 */

import React, { Component, Children } from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';

export default class Html extends Component {
	static propTypes = {
		manifest:  PropTypes.object, // eslint-disable-line react/forbid-prop-types
		pageProps: PropTypes.object, // eslint-disable-line react/forbid-prop-types
		pagePath:  PropTypes.string,
		children:  PropTypes.element.isRequired,
	};

	render () {
		const { manifest, pageProps, children, pagePath } = this.props;

		var head  = Helmet.rewind();
		var meta  = head.meta.toComponent();
		var title = head.title.toComponent();
		var link  = head.link.toComponent();

		function assets (path) {
			if (path[0] === '/') path = path.substr(1);

			if (manifest[path]) return '/' + manifest[path];
			return '/' + path;
		};

		return (
			<html lang="en-us">
				<head>
					<link rel="stylesheet" href={assets('/assets/main.css')} />
					<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet" />
					{title}{meta}{link}
					{pagePath && <link rel="stylesheet" href={assets(`/assets/pages/${pagePath.replace(/\.js$/, '.css')}`)} charSet="UTF-8" />}
				</head>
				<body>
					{/* Content div where the client-side will take over the loading from the server */}
					<div id="root">{Children.only(children)}</div>

					{/* Inject the state from the server to the client to take over */}
					<script
						dangerouslySetInnerHTML={{ __html: `window.__PAGE_PROPS__=${JSON.stringify(pageProps)};` }}
						charSet="UTF-8"
					/>

					<script src={assets('/assets/runtime.js')} charSet="UTF-8" />
					<script src={assets('/assets/vendor.js')} charSet="UTF-8" />
					{pagePath && <script src={assets('/assets/pages/' + pagePath)} charSet="UTF-8" />}
				</body>
			</html>
		);
	}
};

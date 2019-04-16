const html = require('common-tags/lib/stripIndent');

module.exports = exports = function ({ helmet, rendered, manifest, pageProps, pagePath }) {

	function assets (path) {
		if (path[0] === '/') path = path.substr(1);

		if (manifest[path]) return '/' + manifest[path];
		return '/' + path;
	};

	let pageCSS = '';
	let pageScript = '';
	if (pagePath) {
		pageCSS = assets(`/assets/pages/${pagePath.replace(/\.js$/, '.css')}`);
		pageScript = assets('/assets/pages/' + pagePath);
	}

	return html`
		<!DOCTYPE html>
		<html lang="en-us">
			<head>
				<link rel="stylesheet" href="${assets('/assets/main.css')}">
				<link href="https://fonts.googleapis.com/icon?family=Material+Icons" rel="stylesheet">
				${helmet.title.toString() + helmet.meta.toString() + helmet.link.toString()}
				${pageCSS && `<link rel="stylesheet" href="${pageCSS}" charSet="UTF-8">`}
			</head>
			<body ${helmet.bodyAttributes.toString()}>
				<div id="root">${rendered}</div>

				<script charSet="UTF-8">
					window.__PAGE_PROPS__=${JSON.stringify(pageProps)};
				</script>

				<script src="${assets('/assets/runtime.js')}" charSet="UTF-8"></script>
				<script src="${assets('/assets/vendor.js')}" charSet="UTF-8"></script>
				${pageScript && `<script src="${pageScript}" charSet="UTF-8"></script>`}
			</body>
		</html>
	`;

}

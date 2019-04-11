
import Page from '../../pages/index';

export const path = '/';
export const page = 'index.js';

export default function (req, res) {
	const ctx = {
		url: req.originalUrl,
		headers: req.headers,
		cookies: req.cookies,
		params: req.params,
		query: req.query,
		body: req.body,
	};

	res.render(Page, { ctx }, page);
};

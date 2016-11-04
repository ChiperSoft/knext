
import React, { PropTypes } from 'react';
import { map } from 'lodash';

export const path = '/';
export const method = 'all';

const TestPage = ({ ctx }) =>
	<div>
		<h1>This is the front page</h1>

		<b>Query:</b>
		<ul>
			{map(ctx.query, (value, key) => <li><em>{key}</em>: {value}</li>)}
		</ul>

		<b>Body:</b>
		<ul>
			{ctx.body && map(ctx.body, (value, key) => <li><em>{key}</em>: {value}</li>)}
		</ul>

		<b>Headers:</b>
		<ul>
			{map(ctx.headers, (value, key) => <li><em>{key}</em>: {value}</li>)}
		</ul>

		<b>Cookies:</b>
		<ul>
			{map(ctx.cookies, (value, key) => <li><em>{key}</em>: {value}</li>)}
		</ul>


	</div>;

TestPage.propTypes = {
	ctx: PropTypes.shape({
		headers: PropTypes.object,
		query: PropTypes.object,
	}),
};

export default TestPage;

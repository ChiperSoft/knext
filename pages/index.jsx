
import React from 'react';
import PropTypes from 'prop-types';
import { map } from 'lodash';
import styles from './index.scss';
import Box from '../components/Box';

const Page = ({ ctx }) => (
	<div className={styles.root}>
		<h1>This is the front page</h1>

		<b><i className="material-icons">help</i> Query :</b>
		<ul>
			{map(ctx.query, (value, key) => <li key={key}><em>{key}</em>: {value}</li>)}
		</ul>

		<b>Body:</b>
		<ul>
			{ctx.body && map(ctx.body, (value, key) => <li key={key}><em>{key}</em>: {value}</li>)}
		</ul>

		<b>Headers:</b>
		<ul className="headers">
			{map(ctx.headers, (value, key) => <li key={key}><em>{key}</em>: {value}</li>)}
		</ul>

		<b>Cookies:</b>
		<ul>
			{map(ctx.cookies, (value, key) => <li key={key}><em>{key}</em>: {value}</li>)}
		</ul>

		<Box />
	</div>
);

Page.propTypes = {
	ctx: PropTypes.shape({
		headers: PropTypes.object,
		query: PropTypes.object,
	}),
};

export default Page;

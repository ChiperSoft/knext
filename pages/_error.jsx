import React, { PropTypes } from 'react';

const ErrorPage = (props) =>
	<div>
		<h2>An error has occured: </h2>
		{props.errors.map((err, i) => (
			<div key={i}>
				<h3>{err.title}</h3>
				<p>{err.detail}</p>
				<pre><code>{err.stack && err.stack.join('\n')}</code></pre>
			</div>
		))}
	</div>;

ErrorPage.propTypes = {
	errors: PropTypes.arrayOf(PropTypes.shape({
		title: PropTypes.string,
		detail: PropTypes.string,
		stack: PropTypes.arrayOf(PropTypes.string),
	})),
};

export default ErrorPage;

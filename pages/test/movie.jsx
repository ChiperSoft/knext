
import React from 'react';
import PropTypes from 'prop-types';

const Page = (props) => (
	<div>
		<h1>Title: {props.movie.Title}</h1>
	</div>
);

Page.propTypes = {
	movie: PropTypes.arrayOf(PropTypes.shape({
		title: PropTypes.string,
		detail: PropTypes.string,
		stack: PropTypes.arrayOf(PropTypes.string),
	})),
};

export default Page;

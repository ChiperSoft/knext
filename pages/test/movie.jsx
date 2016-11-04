
import React, { PropTypes } from 'react';
import request from '../../models/superagent';

export const path = '/test/movie/:movieid';
export const method = 'get';
export async function loadInitialState (req) {
	var movie = await request.get(`http://www.omdbapi.com/?i=${req.params.movieid}&tomatoes=true`).then((res) => res.body);

	return {
		movie,
	};
}

const TestPage = (props) =>
	<div>
		<h1>Title: {props.movie.Title}</h1>
	</div>;

TestPage.propTypes = {
	movie: PropTypes.arrayOf(PropTypes.shape({
		title: PropTypes.string,
		detail: PropTypes.string,
		stack: PropTypes.arrayOf(PropTypes.string),
	})),
};

export default TestPage;


import request from '../../models/superagent';
import Page from '../../pages/test/movie';

export default Page;
export const path = '/test/movie/:movieid';
export const method = 'get';
export async function loadInitialState (req) {
	var movie = await request.get(`http://www.omdbapi.com/?i=${req.params.movieid}&tomatoes=true`).then((res) => res.body);

	return {
		movie,
	};
}

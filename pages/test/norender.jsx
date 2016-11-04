
import React from 'react';

export const path = '/test/no-render';
export const method = 'get';
export async function loadInitialState (req, res) {
	res.send('Nope!');
	return true;
}

const TestPage = () =>
	<div>
		<h1>This should not have rendered.</h1>
	</div>;

TestPage.propTypes = {};

export default TestPage;

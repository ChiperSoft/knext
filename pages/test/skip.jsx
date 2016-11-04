
import React from 'react';

export const path = '/test/skipped';
export const method = 'get';
export async function loadInitialState () {
	return false;
}

const TestPage = () =>
	<div>
		<h1>This should not have rendered.</h1>
	</div>;

TestPage.propTypes = {};

export default TestPage;

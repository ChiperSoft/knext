
import Page from '../../pages/test/skip';

export default Page;
export const path = '/test/skipped';
export const method = 'get';
export async function loadInitialState () {
	return false;
}

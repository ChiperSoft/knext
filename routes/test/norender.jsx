
import Page from '../../pages/test/norender';

export default Page;
export const path = '/test/no-render';
export const method = 'get';
export async function loadInitialState (req, res) {
	res.send('Nope!');
	return true;
}

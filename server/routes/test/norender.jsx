
export const path = '/test/no-render';
export const method = 'get';

export default async function (req, res) {
	res.send('Nope!');
	return true;
}

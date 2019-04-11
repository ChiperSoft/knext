
const del = require('del');

module.exports = exports = ({ DIST }) =>
	function clean () {
		return del([ DIST ]);
	}
;

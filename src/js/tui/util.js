
define('tui/util', ['tui/util/date', 'tui/util/num', 'tui/util/str', 'tui/util/url'], function(D, N, S, U) {
	return $.extend({}, D, N, S, U);
});

define('tui/history', ['./hashchange'], function(HashChange) {
	var hashChange = new HashChange('http://ui.tudou.com/js/embed/xstorage/index.html'),
		lastUrl = location.hash.replace(/^#+/, '');
	setTimeout(function() {
		hashChange.add(lastUrl);
	}, 1);
	$(document.body).delegate('a', 'click', function(e) {
		var o = $(this),
			url = $(this).attr('href') || '',
			i = url.indexOf('#');
		if(o.closest('#gTop')[0]) return;
		else if(o.closest('#gBtn')[0]) return;
		else if(o.closest('.gbtn_sub')[0]) return;
		else if(o.closest('.gbtn_subbox')[0]) return;
		else if(o.attr('nohash')) return;
		else if(o.hasClass('quick_hook')) return;
		if(i == -1) return;
		else url = url.slice(i);
		url = url.replace(/^#+/, '');
		if(url !== lastUrl) {
			lastUrl = url;
			hashChange.add(url);
		}
	});
	return hashChange;
});

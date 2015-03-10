
define('tui/util/url', function(require, exports) {

	/**
	 * @public 跳到到指定地址，相对于open或location=，但是可以避免IE里location跳转时获取不到referrer的问题
	 * @reference http://webbugtrack.blogspot.com/2008/11/bug-421-ie-fails-to-pass-http-referer.html
	 * @TODO 会引起点击统计无法获得正确的位置编码
	 */
	function openURL(url, target){
		if (!$.browser.msie) {
			if(target)
				window.open(url, target)
			else
				location.href = url;
		} else {
			var a = $('<a href="' + url + '" target="'+ (target||'_self') +'" data-openurl="true"> </a>')[0];
			document.body.appendChild(a);
			a.click();
		}
	}

	function params(url) {
		url = url || location.search || location.href;
		var params = {},
			result = url.match(/[^\s&?#=\/]+=[^\s&?#=]+/g);
		if(result)
			for(var i = 0, l = result.length; i < l; i++) {
				var n = result[i].split('=');
				params[n[0]] = decodeURIComponent(n[1]);
			}
		return params;
	}

	exports.openURL = openURL;
	exports.params = params;
});

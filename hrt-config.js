
var localRoot = __dirname;

exports.serverRoot = localRoot + '/..';

exports.map = [

	['http://js.tudouui.com/v3/dist', localRoot + '/src'],
	['http://css.tudouui.com/v3/dist', localRoot + '/src'],
	['http://ui.tudou.com/v3/dist', localRoot + '/src'],
	['http://js.tudouui.com/v3/src', localRoot + '/src'],
	['http://css.tudouui.com/v3/src', localRoot + '/src'],
	['http://ui.tudou.com/v3/src', localRoot + '/src'],
	// ['http://192.168.1.101/yushi/admin/skin/css/admin.css', localRoot + '/examples/admin.css'],
	// ['http://192.168.1.101/yushi/admin/skin/js/g.js', localRoot + '/examples/g.js'],

];

exports.before = function(url) {
	// Bugfix：Chrome的LESS调试插件请求less文件，所以less文件不能跳转
	if (/\.less$/.test(url)) {
		return;
	}

	var Tudou = this.util.loadPlugin('tudou');

	url = url.replace(/([^?]+)_\d+(\.(?:js|css|swf|png|jpg|gif|svg|ttf|woff|eot))/i, '$1$2');

	if (/\/v3\/(?:dist|build|src)\//i.test(url)) {
		url = Tudou.cssToLess(url);

		url = url.replace(/^http:\/\/[^\/]+(\/v3\/src\/js\/.+\/[\w\-]+\.(?:tpl|vm))$/, 'http://js.tudouui.com$1');
	}

	return url;
};

exports.merge = function(path, callback) {
	var Tudou = this.util.loadPlugin('tudou');

	if (/\/v3\/(?:dist|build|src)\//i.test(this.req.url)) {
		Tudou.merge.call(this, path, callback);
		return;
	}

	Tudou.mergeTui2.call(this, path, callback);
};

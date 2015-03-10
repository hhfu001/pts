define([
	'tui/nprogress',
	'tui/dialog',
	'tui/event'
], function(Nprogress, Dialog, Event) {

	function load(settings) {
		var count = 0;
		var success = settings.success;
		var error = settings.error;
		delete settings.success;
		delete settings.error;
		settings.timeout = 10000;
		
		//载入动画
		settings.nprogress && Nprogress.start();

		settings.success = function(data) {
			if (!data) {
				settings.error();
				return;
			}
			success.apply(this, Array.prototype.slice.call(arguments));

			settings.nprogress && Nprogress.done();
		};
		settings.error = function() {
			count++;
			if(count < 2) {
				$.ajax(settings);
			} else {
				error && error.apply(this, Array.prototype.slice.call(arguments));

				settings.nprogress && Nprogress.done();
			}
		};
		$.ajax(settings);
	}

	// var ajaxUrl = 'http://www.jishachengta.com.cn/api/ajax';
	// var testUrl = 'http://static.jishachengta.com.cn/api/ajax'
	// var isMainDomain = location.host == 'www.jishachengta.com.cn';
	var base_domain = window.base_domain || '';

	if(location.host === '127.0.0.1'){
		base_domain = 'http://www.jishachengta.com.cn';
	}

	var ajaxUrl = base_domain + '/api/ajax' // isMainDomain ? 'http://www.jishachengta.com.cn/api/ajax' : 'http://static.jishachengta.com.cn/api/ajax';
	
	return {
		load : load,
		event : new Event(),
		getData: function(params, cb, error, nprogress) {
			load({
				url: ajaxUrl + '?callback=?',
				data: params,
				dataType: 'jsonp',
				success: function(res) {
					if(res.errno) {
						console.log(res);
						error && error(res);
						Dialog.alert(res.msg || '');
					} else {
						cb && cb(res);
					}
				},
				nprogress : nprogress
			});
		},
		postData: function(params, cb, error) {

			return $.post(ajaxUrl, params, function(res) {
				if(res.errno) {
					console.log(res);
					error && error(res);
					Dialog.alert(res.msg || '');
				} else {
					cb && cb(res);
				}
			}, 'json');
		},
		autoData: function(params, cb, error){
			// isMainDomain = true;

			// this[isMainDomain ? 'postData' : 'getData'](params, cb, error);

		}
	};
});

/** act
* 用户登录 3
* 用户注销 8
* 用户注册 2
* 区域列表 1
* 增加收获地址 4
* 检测手机号是否存在 6
* 发送手机验证码 5
* 提交订单 7
* 修改资料 9
* 修改密码 10
* 找回密码发送手机号 11
* 加关注 12
* 修改收获地址 13
* 删除收获地址 14
**/
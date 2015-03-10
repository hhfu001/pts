/*
 * 微信内置分享调用
 * weixin.setImg(url, 320, 320);
 * weixin.setTitle('abc'); // 'abc —— 来自：土豆'
 * weixin.setTitle('abc', 'efg'); // 设置title及desc文字
 * weixin.bind('share:success', function(){
 *    ...
 * });
 */
define(['tui/model'], function(Model){

	var titleSurfix = '（来自：土豆）';

	var WeixinShare = Model.extend({

		defaults: {
			img_url: 'http://i1.tdimg.com/b/20140411/co7.png',
			img_width: '320',
			img_height: '320',
			link: window.location.href,
			desc: document.title,
			title: document.title + titleSurfix
		},

		setImg: function(url, width, height){
			this.set('img_url', url);
			this.set('img_width', width || '320');
			this.set('img_height', height || '320');
		},

		setLink: function(url){
			this.set('link', url || window.location.href);
		},

		setTitle: function(title, desc){
			title += titleSurfix;

			this.set('desc', desc || title);
			this.set('title', title);
		}
	});

	var weixinShareInstance = new WeixinShare;

	// 检测微信WebView注入API，如果存在则进行初始化绑定
	if (window.WeixinJSBridge && window.WeixinJSBridge.on && window.WeixinJSBridge.invoke) {
		weixinReady();
	} else {
		document.addEventListener && document.addEventListener('WeixinJSBridgeReady', function onBridgeReady(){
			weixinReady();
		}, false);
	}

	function weixinReady(){
		if (!(window.WeixinJSBridge && window.WeixinJSBridge.on && window.WeixinJSBridge.invoke)) return;

		window.WeixinJSBridge.on('menu:share:timeline', function(argv){
			var params = weixinShareInstance.toJSON();
			window.WeixinJSBridge.invoke('shareTimeline', params, function(res) {
				weixinShareInstance.trigger('share:success', [res]);
				weixinShareInstance.trigger('share:timeline:success', [res]);
			});
		});

		window.WeixinJSBridge.on('menu:share:appmessage', function(argv){
			var params = weixinShareInstance.toJSON();
			// params = $(params, { img_url: 'http://i1.tdimg.com/b/20140411/co7.png' });
			window.WeixinJSBridge.invoke('sendAppMessage', params, function(res){
				weixinShareInstance.trigger('share:success', [res]);
				weixinShareInstance.trigger('share:appmessage:success', [res]);
			});
		});
	}

	return weixinShareInstance;

});

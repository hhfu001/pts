
define('tui/flash', [
	'tui/class',
	'tui/event',
	'tui/template',
	'tui/util',
	'tui/dialog'
], function(Class, Event, Template, Util, Dialog, require, exports) {

	function ns(namespace, v, parent, isMixed){
		var i, p = parent || window, n = namespace.split(".").reverse();
		while ((i = n.pop()) && n.length > 0) {
			if (typeof p[i] === 'undefined') {
				p[i] = {};
			} else if (typeof p[i] !== "object") {
				return false;
			}
			p = p[i];
		}
		if (typeof v != "undefined"){
			if(typeof p[i] != 'object'){//TODO 用isPlainObject替换，讨论
				p[i] = v;
			}else{
				$.extend(p[i], v);
			}
		}
		return p[i];
	}

	/**
	 * @public 获取指定的flash对象
	 * @note 用于调用flash里提供的方法
	 * @param {string} m是flash元素的id
	 * @requires jQuery.browser
	 */
	exports.getFlashMC = function(m){
        return document.getElementById(m) || window[m];
	};

	/**
	 * 加载swf的通用方法
	 */
	exports.swfobject = (function(){
		var uuid = 0;
		var isie = !(navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length);
		var webkit = $.browser.webkit;
		var flashMC = exports.getFlashMC;
		var template = {
			'object': '<object id="<%=id%>" <%=classid%> width="<%=width%>" height="<%=height%>" name="<%=name%>" <%=data%> style="<%=style%>" <%=mimetype%> >',
			'embed': '<embed id="<%=id%>" width="<%=width%>" height="<%=height%>" flashvars="<%=flashvars%>" quality="high" name="<%=name%>" src="<%=src%>" style="<%=style%>" <%=mimetype%> ',
			'pluginspage': '<a id=<%=id%> class="tui_noflash" href="#" style="width:<%=width%>;height:<%=height%>;display:block;overflow:hidden;cursor:pointer;<%=style%>" onclick="<%=fn%>()">需要flashplayer插件，点击安装</a>'
		};
		var FLASH_MIME_TYPE = "application/x-shockwave-flash";

		/**
		 * @public
		 */
		var SwfObj = exports.swfClass = Class({
			/**
			 * @constructor
			 */
			initialize: function(opt){
				var self = this;
				uuid++;
				$.extend(this, opt);
				// 默认属性
				var attrs = opt.attrs;
				var flashId = attrs.id;
				if (!flashId)
			   		flashId = attrs.id = 'TUI_flashObj_' + uuid;
				/**
				 * @public flashId
				 */
				this.flashId = flashId;
				if (!attrs.name)
					attrs.name = attrs.id;

				this.pluginspage = opt.pluginspage || pluginspage;
				this.pluginspageTpl = opt.pluginspageTpl || pluginspageTpl;

				var ver = getVersion();
				this.isSupport = ver && ver[0] > 0;
				// 给flash提供通用交互接口
				/**
				 * @public jsapiName
				 */
				var jsapiName = this.jsapiName = opt.flashvars.jsapi = '_TUI_flashObj_' + uuid;
				/**
				 * flash调用的js方法
				 * @public jsapi
				 */
				var jsapi = this.jsapi = window[jsapiName] = {};
				var allowscript = opt.params.allowscriptaccess || opt.params.allowScriptAccess;
				if (allowscript && allowscript != 'never') {
					this.event = new Event();
					$.extend(jsapi, {
						// flash接口初始化之后触发这个方法
						flashReady: function(args){
							self.event.fire('load', args);
						},
						// 取值
						getValue: function(fullname){
							return ns(fullname);
						},
						// 供flash调用任意js方法，获取返回值
						callFunc: function(fullname, args){try{
							return ns(fullname).apply(ns(fullname.replace(/\.[^\.]+$/, '')), args);
						}catch(ex){return false;}},
						// 用来处理所有flash事件
						notify: function(eventName, args){
							self.event.fire(eventName, args);
						}
					});
				}
			},
			/**
			 * public 嵌入flash标签
			 * @param {String} * objid是用来替换的页面元素的id，在没有id的时候使用document.write
			 */
			load: function(objid){
				var box = objid ? $('#' + objid)[0] : false;
				if (box) { //用flash标签替换指定id的页面元素
					if (box.outerHTML && !$.browser.opera) { // for ie
						box.outerHTML = this.getHTML();
					} else {
						/*var self = this, f = TUI.addElm(this.getHTML(), function(){
							box.parentNode.replaceChild(this, box);
							//this.setAttribute("data", self.attrs.src); //防止重复加载 @TODO 此方法无效
						});*/
						var self = this, f = $(this.getHTML())[0];
						box.parentNode.replaceChild(f, box);
					}
				} else { //在没有提供替换的页面元素时，在load方法执行的地方直接写入flash标签
					document.write(this.getHTML());
				}
			},
			/**
			 * 针对ie或其他浏览器生成相应的flash标签的html代码
			 */
			getHTML: function() {
				var n, k, self = this, html = [], vars = [],
					attrs = this.attrs, flashvars = this.flashvars, params = this.params;
				if (this.isSupport) {
					if (webkit && webkit < 312 || !isie && this.type === "embed") {
						for (n in flashvars)
							vars.push(n + "=" + flashvars[n]);
						attrs.flashvars = vars.join("&");
						attrs.mimetype = 'type="' + FLASH_MIME_TYPE + '"';
						html.push(Template.format(template['embed'], attrs));
						for (k in params)
							html.push(k + '="' + params[k] + '" ');
						html.push(' ></embed>');
					} else {
						if (isie) {
							attrs.classid = 'classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"';
						} else {
							attrs.data = 'data="' + attrs.src + '"';
							attrs.mimetype = 'type="' + FLASH_MIME_TYPE + '"';
						}
						html.push(Template.format(template['object'], attrs));
						if(isie)
							params["movie"] = attrs.src;
						params["quality"] = "high";
						for (k in params)
							html.push('<param name="', k, '" value="', params[k], '" />');

						for (n in flashvars)
							vars.push(n + "=" + flashvars[n]);
						if (vars.length > 0)
							html.push('<param name="flashvars" value="', vars.join("&"), '" />');
						html.push("</object>");
					}
				} else { // 没安装flash插件
					var w = attrs.width, h = attrs.height;
					html.push(Template.format(this.pluginspageTpl(), $.extend(attrs, {
						width: !w && 'auto' || /%$/.test(w) && w || w + "px",
						height: !h && 'auto' || /%$/.test(h) && h || h + "px",
						fn: this.jsapiName + ".pluginspage" // 点击事件
					})));
					this.jsapi.pluginspage = function(){
						return self.pluginspage.call(self);
					};
				}
				return html.join("");
			},

			// 以下是调用flash接口的方法

			/**
			 * onload之后
			 */
			ready: function(fn){
				this.event.bind('load', fn);
			},
			/**
			 * 申请监听flash的事件，必须等onload后执行
			 */
			bind: function(eventName, handler){
				this.event.bind(eventName, handler);
				flashMC(this.flashId)._addEventListener(eventName, this.jsapiName + '.notify');
			},
			/**
			 * 直接调用flash内部的方法，有返回值，必须等onload后执行
			 */
			callMethod: function(methodName, args){
				return flashMC(this.flashId)._call(methodName, args);
			}
		});

		/**
		 * @factory 初始化flash对象
		 * @param {Object} url是swf地址
		 * @param {Object} w是flash宽度
		 * @param {Object} h是flash高度
		 * @param {Object} vars是flashvars属性
		 * @param {Object} params是flash元素里的param标签
		 * @param {Object} attrs是flash标签本身的属性
		 */
		function swfobject(url,w,h,vars,params,attrs){
			attrs = $.extend(attrs || {}, {
				src: url,
				width: w,
				height: h
			});
			var tagType = attrs.tagType;
			delete attrs.tagType;
			return new SwfObj({
				type: tagType,
				attrs: attrs,
				params: params,
				flashvars: vars,
				pluginspage: pluginspage,
				pluginspageTpl: pluginspageTpl
			});
		}

		$.extend(swfobject, {
			getVersion: getVersion,
			setPluginspage: function(fn){
				var oldfn = pluginspage;
				pluginspage = function(){
					return fn.call(this, oldfn);
				};
			},
			setPluginspageTpl: function(fn){
				var oldfn = pluginspageTpl;
				pluginspageTpl = function(){
					return fn.call(this, oldfn);
				};
			}
		});

		return swfobject;

		/**
		 * @static 获取flashplayer的版本
		 * @return {Array}
		 */
		function getVersion() {
			var ver = [0,0,0];
			if (navigator.plugins && navigator.mimeTypes.length) {
				var x = navigator.plugins["Shockwave Flash"];
				if (x && x.description) //"10.0 r115", "10.0 d51", "10.0 b51"
					ver = x.description.replace(/^\D+/, '').replace(/\s*r/, '.').replace(/\s*[a-z]+\d*/, '.0').split('.');
			} else {
				if (navigator.userAgent && navigator.userAgent.indexOf("Windows CE") >= 0) {
					var axo = 1;
					var n = 3;
					while (axo) {
						try {
							n++;
							axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash." + n);
							ver = [n, 0, 0];
						} catch(e) {
							axo = null;
						}
					}
				} else {
					try {
						var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.7");
					} catch(e) {
						try {
							var axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash.6");
							ver = [6, 0, 21];
							axo.AllowScriptAccess = "always";
						} catch(e) {
							if (ver.major == 6)
								return ver;
						}
						try {
							axo = new ActiveXObject("ShockwaveFlash.ShockwaveFlash");
						} catch(e) {}
					}
					if (axo != null) {
						ver = axo.GetVariable("$version").split(" ")[1].split(",");
					}
				}
			}
			return ver;
		}

		function pluginspage(){
			Dialog.alert('安装完flashplayer之后，要记得先重新启动浏览器，再访问土豆喔', function(){
				Util.openURL('http://get.adobe.com/flashplayer/', '_blank');
			});
			return false;
		}

		function pluginspageTpl(){
			return template['pluginspage'];
		}

	})();

});

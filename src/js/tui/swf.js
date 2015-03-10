define('tui/swf', (function() {
	var SHOCKWAVE_FLASH = 'Shockwave Flash',
		FLASH_MIME_TYPE = 'application/x-shockwave-flash',
		SHOCKWAVE_FLASH_AX = 'ShockwaveFlash.ShockwaveFlash',
		isOldIE = !(navigator.plugins && navigator.mimeTypes && navigator.mimeTypes.length);

	function getVersion() {
		var d,
			ver = [0, 0, 0];
		if(navigator.plugins !== undefined && $.type(navigator.plugins[SHOCKWAVE_FLASH]) == 'object') {
			d = navigator.plugins[SHOCKWAVE_FLASH].description;
			if (d && !(navigator.mimeTypes !== undefined && navigator.mimeTypes[FLASH_MIME_TYPE] && !navigator.mimeTypes[FLASH_MIME_TYPE].enabledPlugin)) { // navigator.mimeTypes["application/x-shockwave-flash"].enabledPlugin indicates whether plug-ins are enabled or disabled in Safari 3+
				d = d.replace(/^.*\s+(\S+\s+\S+$)/, '$1');
				ver[0] = parseInt(d.replace(/^(.*)\..*$/, '$1'), 10);
				ver[1] = parseInt(d.replace(/^.*\.(.*)\s.*$/, '$1'), 10);
				ver[2] = /[a-zA-Z]/.test(d) ? parseInt(d.replace(/^.*[a-zA-Z]+(.*)$/, '$1'), 10) : 0;
			}
		}
		else if(window.ActiveXObject !== undefined) {
			try {
				var a = new ActiveXObject(SHOCKWAVE_FLASH_AX);
				if(a) { // a will return null when ActiveX is disabled
					d = a.GetVariable('$version');
					if (d) {
						d = d.split(' ')[1].split(',');
						ver = [parseInt(d[0], 10), parseInt(d[1], 10), parseInt(d[2], 10)];
					}
				}
			}
			catch(e) {}
		}
		return ver;
	}
	function createSwf(attrs, params, node) {
		//ie下需考虑原有节点就是个object（flash）的情况，强行覆盖会致使flash无法正常播放。移除原object再插入新div节点，再动态插入flash到新div节点中。也可防止内存泄漏。附加判断node是否还在dom中，根据parentNode。
		if(node.nodeName == 'OBJECT' && node.parentNode) {
			var newDiv = document.createElement('div');
			node.parentNode.insertBefore(newDiv, node);
			removeObject(node);
			createHtml(attrs, params, newDiv);
		}
		else
			createHtml(attrs, params, node);
	}
	function createHtml(attrs, params, node) {
		if(isOldIE)
			createHtml = createInIe;
		else
			createHtml = createInNormal;
		createHtml(attrs, params, node);
	}
	function createInIe(attrs, params, node) {
		var att = '',
			par = '';
		for(var i in attrs)
			if(attrs[i] != Object.prototype[i]) { //需过滤掉一些潜在因素为prototype添加属性
				if(i.toLowerCase() == 'data')
					params.movie = attrs[i];
				else if(i.toLowerCase() == 'class')
					att += ' class="' + attrs[i] + '"';
				else if(i.toLowerCase() != 'classid')
					att += ' ' + i + '="' + attrs[i] + '"';
			}
		for(var j in params) {
			if(params[j] != Object.prototype[j]) //同上
				par += '<param name="' + j + '" value="' + params[j] + '"/>';
		}
		node.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + att + '>' + par + '</object>';
	}
	function createInNormal(attrs, params, node) {
		var o = document.createElement('object');
		o.setAttribute('type', FLASH_MIME_TYPE);
		for(var m in attrs)
			if(attrs[m] != Object.prototype[m]) { //同上
				if(m.toLowerCase() == 'class')
					o.setAttribute('class', attrs[m]);
				else if(m.toLowerCase() != "classid") //过滤掉IE特有属性
					o.setAttribute(m, attrs[m]);
			}
		for(var n in params)
			if(params[n] != Object.prototype[n] && n.toLowerCase() != 'movie') //同上
				createObjParam(o, n, params[n]);
		node.parentNode.replaceChild(o, node);
	}
	function createObjParam(el, pName, pValue) {
		var p = document.createElement('param');
		p.setAttribute('name', pName);
		p.setAttribute('value', pValue);
		el.appendChild(p);
	}

	function removeObject(obj, cb) {
		try {
			obj.blur();
		} catch(e) {
			//
		}
		//ie下需移除object上的function，以免内存泄漏。移除需要在readyState为4后进行，无法侦听，只能用定时器
		if(isOldIE)
			removeObject = removeObjectInIe;
		else
			removeObject = removeObjectInNormal;
		removeObject(obj, cb);
	}
	function removeObjectInIe(obj, cb) {
		obj.style.display = 'none';
		var i = 0;
		(function(){
			if(obj.readyState == 4 || i++ > 10) {
				for(var i in obj)
					if($.isFunction(obj[i]))
						obj[i] = null;
				obj.parentNode.removeChild(obj);
				if($.isFunction(cb))
					cb();
				return;
			}
			setTimeout(arguments.callee, 100);
		})();
	}
	function removeObjectInNormal(obj, cb) {
		obj.parentNode.removeChild(obj);
		if($.isFunction(cb))
			cb();
	}

	return {
		/**
		 * @public 获取flash对象
		 * @param {string} 对象id
		 */
		getItem: function(id){
			return document.getElementById(id);
		},

		/**
		 * @public 改写swfobject设置flash对象
		 * @param {string} swf对象的url
		 * @param {string} 动态写入的node的id
		 * @param {int} width
		 * @param {int} height
		 * @param {object} flashvars
		 * @param {object} param标签参数
		 * @param {object} object标签参数
		 */
		setItem: function(url, id, width, height, flashvars, params, attrs) {
			id = id.replace(/^#/, '');
			width = width || '100%';
			height = height || '100%';
			flashvars = flashvars || {};
			var node = document.getElementById(id),
				p = {},
				a = {};
			if(node) {
				//将url、width、height混入attrs中，防止原配置参数被修改：这是个很隐蔽的引用修改bug
				$.extend(true, a, attrs, {
					data: url,
					width: width + '',
					height: height + ''
				});
				//没有设置id则继承原有dom元素的id
				if(!a.id)
					a.id = id;
				$.extend(true, p, params);
				p.flashvars = $.param(flashvars);
				createSwf(a, p, node);
				return this.getItem(a.id);
			}
			return this;
		},

		/**
		 * @public 移除flash对象
		 * @param {string/object} 对象selector或jq本身
		 * @param {func} 移除后的回调函数
		 */
		removeItem: function(id, cb) {
			var obj = $.type(id) == 'string' ? $(id.replace(/^#?/, '#'))[0] : id;
			if(obj && obj.nodeName == 'OBJECT')
				removeObject(obj, cb);
			return this;
		},

		/**
		 * @public 获取flash版本，单例闭包
		 * @return {array} 3位长度的版本号
		 */
		version: function() {
			var version = getVersion();
			this.version = function() {
				return version;
			};
			return version;
		}
	};

})());

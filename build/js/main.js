/**
 * @modified $Author$
 * @version $Rev$
 */

(function($) {


require.config({ enable_ozma: true });


/* @source tui/class.js */;


define('tui/class', [], function() {

	function init() {
		return function() {
			if (this.initialize) {
				this.initialize.apply(this, arguments);
			}
		};
	}

	function extend(protoProps, staticProps) {
		var parent = this;

		var child = init();

		$.extend(child, parent, staticProps);

		var proto = Object.create(parent.prototype);
		proto.constructor = child;
		child.prototype = proto;

		$.extend(child.prototype, protoProps);

		child.superClass = parent.prototype;

		return child;
	}

	var Class = function(protoProps) {
		var cls = init();

		$.extend(cls.prototype, protoProps);

		cls.extend = extend;

		return cls;
	};

	Class.extend = extend;

	return Class;

});

/* @source tui/event.js */;


define('tui/event', [
  "tui/class"
], function(Class) {
	var Event = Class({
		initialize : function() {
			this.__event = window.Zepto ? new window.Zepto.Events : $({});
		}
	});

	var proto = Event.prototype;

	['bind', 'one'].forEach(function(method) {
		proto[method] = function(type, handler, context) {
			if($.isPlainObject(type)){
				for(var i in type)
					this[method](i, type[i]);
			}else{
				var event = this.__event;
				var callback = function() {
					return handler.apply(context || event, arguments.length > 0 ? (window.Zepto ? arguments : Array.prototype.slice.call(arguments, 1)) : []);
				};
				event[method].call(event, type, callback);
                handler.guid = callback.guid;
			}
			return this;
		};
	});
	['unbind', 'trigger', 'triggerHandler'].forEach(function(method) {
		proto[method] = function() {
			var event = this.__event;
			if (require.debug) {
				console.log('[event] ' + this.constructor.__mid +  ' : ' + arguments[0], arguments[1]);
			}
			var ret = event[method].apply(event, arguments);
			if (require.debug && ret != event && ret != undefined) {
				console.log(ret);
			}
			return ret;
		};
	});

	proto.fire = proto.trigger;
	proto.firing = proto.triggerHandler;
	Event.mix = function(receiver) {
		return $.extend(receiver, new Event());
	};

	return Event;

});

/* @source tui/placeholder.js */;

define('tui/placeholder', [
  "tui/event"
], function(Event) {
	var PLACEHOLDER = 'placeholder' in document.createElement('input'),
		list = [],
		Klass = Event.extend({
			initialize: function(item, state) {
				var self = this;
				Klass.superClass.initialize.apply(self, arguments);
				item = $(item);
				self.item = item;
				var ph = self.ph = item.attr('placeholder');
				//占位符为空字符串跳过
				if(ph == '')
					return;
				//初始化判断，因为ie和ff会在刷新页面后可能autocomplete遗留表单数据，此时占位符就成为遗留的默认数据；也可能在js执行前有用户输入。唯一的缺点是假如在js执行前用户输入的和占位符相同，会被误认为占位符，可忽视。
				if(state)
					self.state2 = state;
				else if(ph == item.val() || item.val() == '')
					self.state2 = true;
				else
					self.state2 = false;
				if(!PLACEHOLDER && self.state2) {
					item.val(ph);
					self.trigger('placeholder', [item, self.state2]);
				}
				self.focus = function() {
					//打开状态下认为是占位符
					if(self.state2) {
						!PLACEHOLDER && item.val('');
						self.state2 = false;
						self.trigger('placeholder', [item, self.state2]);
					}
				};
				self.blur = function() {
					//离开时如有输入数据开关关闭，否则打开
					var s = item.val();
					if(s == '') {
						!PLACEHOLDER && item.val(ph);
					}
					self.state2 = s == '';
					if(self.state2) {
						self.trigger('placeholder', [item, self.state2]);
					}
				};
				//失聚焦时判断
				item.focus(self.focus).bind('blur', self.blur);
			},
			state: function(state) {
				var self = this;
				if(state !== undefined) {
					self.state2 = state;
					if(state) {
						self.restore();
					}
				}
				return self.state2;
			},
			restore: function() {
				var self = this;
				if(!self.state2 && !PLACEHOLDER) {
					self.state2 = true;
					self.item.val(self.ph);
					self.trigger('placeholder', [self.item, self.state2]);
				}
			},
			cancel: function() {
				var self = this;
				self.item.unbind('focus', self.focus).unbind('blur', self.blur);
				var idx = list.indexOf(self.item[0]);
				if(idx > -1) {
					list.splice(idx, 1);
				}
				return self;
			}
		});
	Klass.NATIVE = PLACEHOLDER;
	return Klass;
});

/* @source tui/limitTextarea.js */;

define('tui/limitTextarea', [
  "tui/event"
], function(Event) {
	var ie9 = $.browser.msie && $.browser.version == '9.0';
	function virtualTextareaMaxlength(item) {
		var max = parseInt(item.attr('maxlength')),
			v = item.val();
		if(!isNaN(max) && v.length > max) {
			var i,
				bookmark,
				oS = document.selection.createRange(),
				oR = document.body.createTextRange();
			oR.moveToElementText(item[0]);
			bookmark = oS.getBookmark();
			for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i++)
				//ie的换行是\r\n，算2个字符长度
				if(v.charAt(i) == '\n')
					i++;
			item.val(v.substr(0, Math.min(max, i - 1)) + v.substr(i, Math.min(max, v.length)));
			//模拟光标位置
			if(v.length != i) {
				var range = item[0].createTextRange();
				range.collapse(true);
				range.moveEnd('character', i - 1);
				range.moveStart('character', i - 1);
				range.select();
			}
		}
	}
	function cb(self, item) {
		var v = item.val();
		self.trigger('input', [v.length, parseInt(item.attr('maxlength'))]);
	}
	var Klass = Event.extend({
		initialize: function(item) {
			var self = this;
			Klass.superClass.initialize.apply(self, arguments);
			if($.type(item) == 'string')
				item = $(item);
			if(window.addEventListener) {
				item.bind('input', function() {
					if(ie9)
						virtualTextareaMaxlength(item);
					cb(self, item);
				});
				//ie9对于delete、backspace、剪切、粘帖不支持，需hack
				if(ie9)
					item.bind('keydown cut paste', function(e) {
						switch(e.type) {
							case 'keydown':
								if(e.keyCode != 46 && e.keyCode != 8)
									return;
							default:
								setTimeout(function() {
									virtualTextareaMaxlength(item);
									cb(self, item);
								}, 0);
						}
					});
			}
			else {
				item.bind('propertychange', function() {
					virtualTextareaMaxlength(item);
					cb(self, item);
				});
			}
		}
	});
	return Klass;
});

/* @source tui/html5formcore.js */;

define('tui/html5formcore', [
  "tui/event",
  "tui/limitTextarea",
  "tui/placeholder"
], function(Event, LimitTextarea, Placeholder) {
	var ie9 = $.browser.msie && $.browser.version == '9.0',
		TYPE_VALID = {
			'url': /^\s*[a-zA-z]+:\/\/.*$/,
			'email': /^\s*\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*\s*$/,
			'number': /^\s*-?\.*\d+\s*$/,
			'date': /^\s*\d{2,4}-\d{1,2}-\d{1,2}\s*$/,
			'time': /^\s*\d{1,2}:\d{1,2}(:\d{1,2}(\.\d{1,3})?)?\s*$/,
			'color': /^\s*#?[a-z\d]{3,6}\s*$/
		},
		input = document.createElement('input'),
		AUTOFOCUS = 'autofocus' in input,
		FORM = 'form' in input,
		SELECTOR = ':input:not(:button, :submit, :radio, :checkbox, :reset)',
		Klass = Event.extend({
			initialize: function(form, callback, type) {
				var self = this;
				Klass.superClass.initialize.apply(self, arguments);
				if($.type(form) == 'string')
					form = $(form);
				self.form2 = form;
				self.type2 = type = type || Klass.VALID_BLUR;
				self.list2 = [];
				self.ph2 = [];
				if($.type(callback) != 'function') {
					type = callback;
					callback = undefined;
				}
				//init
				if(!form[0] || form[0].nodeName != 'FORM')
					return;
				//autofocus
				if(!AUTOFOCUS)
					form.find(':input').each(function() {
						if(this.getAttribute('autofocus') != null) {
							var item = $(this);
							item.focus();
						}
					});
				//placeholder
				if(!Placeholder.NATIVE)
					form.find('input[placeholder]').each(function() {
						var item = $(this),
							ph = new Placeholder(item);
						self.list2.push(this);
						self.ph2.push(ph);
						ph.bind('placeholder', function(item, state) {
							self.trigger('placeholder', [item, state]);
						});
					});
				//delegate
				self.focusout2 = function() {
					form.attr('novalidate') || self.valid($(this));
				};
				if(type == Klass.VALID_BLUR)
					form.delegate(SELECTOR, 'focusout', self.focusout2);
				var ta = [];
				self.focusin2 = function() {
					//LimitTextarea
					var item = $(this);
					if(this.nodeName == 'TEXTAREA' && ta.indexOf(this) == -1) {
						new LimitTextarea(item);
						ta.push(this);
					}
					self.trigger('focus', [item]);
				};
				form.delegate(SELECTOR, 'focusin', self.focusin2);
				//触发输入
				self.input2 = function() {
					self.trigger('input', [$(this)]);
				};
				self.keydown_cut_paste2 = function(e) {
					var o = $(this);
					switch(e.type) {
						case 'keydown':
							if(e.keyCode != 46 && e.keyCode != 8)
								return;
						default:
							setTimeout(function() {
								self.trigger('input', [o]);
							}, 0);
					}
				};
				if(window.addEventListener) {
					form.delegate(SELECTOR, 'input', self.input2);
					if(ie9)
						form.delegate('textarea', 'keydown cut paste', self.keydown_cut_paste2);
				}
				else
					form.delegate(SELECTOR, 'keydown contextmenu', self.input2);
				//代理input[text]的点击使浏览器原声html5校验ui失效
				form.delegate('input:text[name]', 'keypress', function(e) {
					if(e.keyCode == 13) {
						e.preventDefault();
						form.submit();
					}
				});
				//代理input[submit]的点击使浏览器原声html5校验ui失效
				self.click2 = function(e) {
					e.preventDefault();
					form.submit();
				};
				form.delegate('input:submit', 'click', self.click2);
				self.submit2 = function(e) {
					//form需要验证并且通过验证后触发callback
					var res = form.attr('novalidate') || self.validAll();
					if(res) {
						if(callback) {
							return callback.call(this, e);
						}
					}
					else {
						e.preventDefault();
					}
				};
				form.bind('submit', self.submit2);
			},
			valid: function(item) {
				var form = this.form2,
					v = item.val(),
					type = (item[0].getAttribute('type') || 'text').toLowerCase(),
					pattern = item.attr('pattern'),
					required = item[0].getAttribute('required') != null,
					index = this.list2.indexOf(item[0]);
				//required，注意placeholder冲突
				if(required && (v == '' || (index != -1 && this.ph2[index].state())) && !this.ignore(item)) {
					this.trigger('required', [item]);
					return false;
				}
				//几种input类型
				if(v && v.length && item[0].nodeName == 'INPUT' && !this.ignore(item) && TYPE_VALID[type] && !TYPE_VALID[type].test(v)) {
					this.trigger(type, [item]);
					return false;
				}
				//number类型另附验证范围
				if(v && v.length && type == 'number' && !this.ignore(item)) {
					var max = parseFloat(item.attr('max')),
						min = parseFloat(item.attr('min')),
						v2 = parseFloat(v);
					if(!isNaN(max) && v2 > max) {
						this.trigger('max', [item, max]);
						return false;
					}
					if(!isNaN(min) && v2 < min) {
						this.trigger('min', [item, min]);
						return false;
					}
				}
				//自定义pattern，只支持text类型，注意placeholder冲突
				if(pattern && pattern.length && type == 'text' && v && !this.ignore(item)) {
					if(index != -1 && this.ph2[index].state()) {
						return true;
					}
					pattern = new RegExp(pattern);
					if(!pattern.test(v)) {
						this.trigger('pattern', [item]);
						return false;
					}
				}
				return true;
			},
			validAll: function() {
				var self = this,
					res = true,
					list = self.form2.find(SELECTOR);
				list.each(function(i) {
					res = res && self.valid(list.eq(i));
				});
				return res;
			},
			ignore: function(item) {
				if($.type(item) == 'string')
					item = $(item);
				return item.prop('disabled') || item[0].getAttribute('novalidate') != null;

			},
			type: function() {
				return this.type2;
			},
			placeholder: function(item, state) {
				item = $(item);
				var i = this.list2.indexOf(item[0]);
				if(i != -1)
					return this.ph2[i];
				console.error('placeholder not found: ' + item[0]);
			},
			cancel: function() {
				this.form2.undelegate(SELECTOR, 'focusout', this.focusout2);
				this.form2.undelegate(SELECTOR, 'focusin', this.focusin2);
				this.form2.undelegate(SELECTOR, 'input', this.input2);
				if(ie9)
					this.form2.undelegate('textarea', 'keydown cut paste', this.keydown_cut_paste2);
				this.form2.undelegate(SELECTOR, 'keydown contextmenu', this.input2);
				this.form2.undelegate('input:submit', 'click', this.click2);
				this.form2.unbind('submit', this.submit2);
				this.ph2.forEach(function(ph) {
					ph.cancel();
				});
			}
		});
	Klass.VALID_BLUR = 1;
	Klass.VALID_SUBMIT = 2;
	Klass.SELECTOR = SELECTOR;
	return Klass;
});

/* @source tui/template.js */;

/**
 * A lightweight and enhanced micro-template implementation, and minimum utilities
 *
 * using AMD (Asynchronous Module Definition) API with OzJS
 * see http://ozjs.org for details
 *
 * Copyright (C) 2010-2012, Dexter.Yy, MIT License
 * vim: et:ts=4:sw=4:sts=4
 */
define('tui/template', [], function(require, exports){

	exports.ns = function(namespace, v, parent){
		var i, p = parent || window, n = namespace.split(".").reverse();
		while ((i = n.pop()) && n.length > 0) {
			if (typeof p[i] === 'undefined') {
				p[i] = {};
			} else if (typeof p[i] !== "object") {
				return false;
			}
			p = p[i];
		}
		if (typeof v !== 'undefined')
			p[i] = v;
		return p[i];
	};

	exports.format = function(tpl, op){
		return tpl.replace(/<%\=(\w+)%>/g, function(e1,e2){
			return op[e2] != null ? op[e2] : "";
		});
	};

	exports.escapeHTML = function(str){
		str = str || '';
		var xmlchar = {
			//"&": "&amp;",
			"<": "&lt;",
			">": "&gt;",
			"'": "&#39;",
			'"': "&quot;",
			"{": "&#123;",
			"}": "&#125;",
			"@": "&#64;"
		};
		return str.replace(/[<>'"\{\}@]/g, function($1){
			return xmlchar[$1];
		});
	};

	exports.substr = function(str, limit, cb){
		if(!str || typeof str !== "string")
			return '';
		var sub = str.substr(0, limit).replace(/([^\x00-\xff])/g, '$1 ').substr(0, limit).replace(/([^\x00-\xff])\s/g, '$1');
		return cb ? cb.call(sub, sub) : (str.length > sub.length ? sub + '...' : sub);
	};

	exports.strsize = function(str){
		return str.replace(/([^\x00-\xff]|[A-Z])/g, '$1 ').length;
	};

	var document = this.document;

	exports.tplSettings = {
		_cache: {},
		evaluate: /<%([\s\S]+?)%>/g,
		interpolate: /<%=([\s\S]+?)%>/g
	};

	exports.tplHelpers = {
		mix: $.extend,
		escapeHTML: exports.escapeHTML,
		substr: exports.substr,
		include: convertTpl,
		_has: function(obj){
			return function(name){
				return exports.ns(name, undefined, obj);
			};
		}
	};

	function convertTpl(str, data, namespace){
		var func, c  = exports.tplSettings, suffix = namespace ? '#' + namespace : '';
		if (!/[\t\r\n% ]/.test(str)) {
			func = c._cache[str + suffix];
			if (!func) {
				var tplbox = document.getElementById(str);
				if (tplbox) {
					func = c._cache[str + suffix] = convertTpl(tplbox.innerHTML, false, namespace);
				}
			}
		} else {
			var funStr = 'var __p=[];'
				+ (namespace ? '' : 'with(obj){')
					+ 'var mix=api.mix,escapeHTML=api.escapeHTML,substr=api.substr,include=api.include,has=api._has(' + (namespace || 'obj') + ');'
					+ '__p.push(\'' +
					str.replace(/\\/g, '\\\\')
						.replace(/'/g, "\\'")
						.replace(c.interpolate, function(match, code) {
							return "'," + code.replace(/\\'/g, "'") + ",'";
						})
						.replace(c.evaluate || null, function(match, code) {
							return "');" + code.replace(/\\'/g, "'")
												.replace(/[\r\n\t]/g, ' ') + "__p.push('";
						})
						.replace(/\r/g, '\\r')
						.replace(/\n/g, '\\n')
						.replace(/\t/g, '\\t')
					+ "');"
				+ (namespace ? "" : "}")
				+ "return __p.join('');"
			try{
				func = new Function(namespace || 'obj', 'api', funStr);
			}catch(e){
				console.log("Could not create a template function: \n" + funStr);
			}
		}
		return !func ? '' : (data ? func(data, exports.tplHelpers) : func);
	}

	exports.convertTpl = convertTpl;
	exports.reloadTpl = function(str){
		delete exports.tplSettings._cache[str];
	};

});

/* @source tui/html5form.js */;

define('tui/html5form', [
  "tui/template",
  "tui/html5formcore",
  "tui/placeholder"
], function(template, Html5formcore, Placeholder) {
	var tpl = '<div class="g_tip"><h3><%=msg%></h3><% if(info && info.length) { %><p><%=info%></p><% } %><span class="arrow"></span></div>',
		TYPE_MES = {
			'url': 'url格式不合法',
			'email': 'email格式不合法',
			'number': '请输入一个数字',
			'max': '值必须小于或等于',
			'min': '值必须大于或等于',
			'date': '日期格式不合法',
			'time': '时间格式不合法',
			'color': '颜色格式不合法',
			'required': '请填写此项',
			'pattern': '不符合要求格式'
		},
		$body = $('body'),
		$win = $(window),
		Klass = Html5formcore.extend({
			initialize: function() {
				var self = this;
				Klass.superClass.initialize.apply(self, arguments);
				//init
				self.phs3 = [],
				self.msg3 = [],
				self.list3 = [],
				self.action3 = [];
				self.bind('required', function(item) {
					self.tip(item, TYPE_MES['required']);
				});
				self.bind('url', function(item) {
					self.tip(item, TYPE_MES['url']);
				});
				self.bind('email', function(item) {
					self.tip(item, TYPE_MES['email']);
				});
				self.bind('number', function(item) {
					self.tip(item, TYPE_MES['number']);
				});
				self.bind('max', function(item, v) {
					self.tip(item, TYPE_MES['max'] + v);
				});
				self.bind('min', function(item, v) {
					self.tip(item, TYPE_MES['min'] + v);
				});
				self.bind('date', function(item) {
					self.tip(item, TYPE_MES['date']);
				});
				self.bind('time', function(item) {
					self.tip(item, TYPE_MES['time']);
				});
				self.bind('color', function(item) {
					self.tip(item, TYPE_MES['color']);
				});
				self.bind('required', function(item) {
					self.tip(item, TYPE_MES['required']);
				});
				self.bind('pattern', function(item) {
					self.tip(item, TYPE_MES['pattern']);
				});
				self.bind('placeholder', function(item, state) {
					item = $(item);
					if(state)
						item.addClass('g_placeholder');
					else
						item.removeClass('g_placeholder');
				});
				self.bind('input', function(item) {
					self.clear(item);
				});
				//低版本浏览器初始化具有placeholder的input
				if(!Placeholder.NATIVE) {
					var phs = self.form2.find('input[placeholder]');
					phs.each(function(i, item) {
						var ph = self.placeholder(item),
							state = ph.state();
						if(state) {
							$(item).addClass('g_placeholder');
						}
					});
				}
			},
			tip: function(item, msg) {
				console && console.warn && console.warn(item);
				var self = this;
				self.clearAll();
				self.list3.push(item);
				self.phs3.push(item[0]);
				item.addClass('g_valid');
				var o = $(template.convertTpl(tpl, {
					msg: msg,
					info: item.attr('title') || ''
				}));
				o.css({
					left: item.offset().left,
					top: item.offset().top + item.outerHeight() + 7
				});
				o.click(function() {
					item.focus();
				});
				self.msg3.push(o);
				$body.append(o);
				var offset = o.offset().top + o.outerHeight() - $win.scrollTop() - $win.height();
				if(offset > 0)
					$win.scrollTop($win.scrollTop() + offset);
				var i = 4,
					s;
				self.action3.push(s = setInterval(function() {
					o.css('left', o.offset().left + i);
					if(i < 0) {
						++i;
					}
					if(i == 0) {
						clearInterval(s);
						return;
					}
					i *= -1;
				}, 50));
				if($win.scrollTop() > item.offset().top) {
					$win.scrollTop(item.offset().top);
				}
				else if($win.scrollTop() + $win.height() < item.offset().top + item.height()) {
					$win.scrollTop(item.offset().top + item.height() - $win.height());
				}
				//过段时间清除
				if(self.ct) {
					clearTimeout(self.ct);
				}
				self.ct = setTimeout(function() {
					self.clearAll();
				}, 5000);
				return this;
			},
			clear: function(item) {
				if($.type(item) == 'string')
					item = $(item);
				var i = this.phs3.indexOf(item[0]);
				if(i != -1) {
					this.phs3.splice(i, 1);
					this.list3.splice(i, 1);
					this.msg3[i].remove();
					this.msg3.splice(i, 1);
					clearInterval(this.action3[i]);
					this.action3.splice(i, 1);
					item.removeClass('g_valid');
				}
				return this;
			},
			clearAll: function() {
				this.phs3 = [];
				while(this.msg3.length) {
					this.msg3.pop().remove();
				}
				while(this.list3.length) {
					this.list3.pop().removeClass('g_valid');
				}
				while(this.action3.length) {
					var o = this.action3.pop();
					clearInterval(o);
				}
				return this;
			}
		});
	return Klass;
});

/* @source tui/drag.js */;


define('tui/drag', [
  "tui/event"
], function(Event) {

	var win = $(window);

	function clearSelection() {
		if(window.getSelection)
			window.getSelection().removeAllRanges();
		else if(document.selection)
			document.selection.empty();
		return this;
	}

    function selectListener(e){
        e.preventDefault();
    }

	var Klass = Event.extend({
		initialize : function(node, options) {
			var self = this;
			options = options || {};
			var handler = options.handler || node;
			Klass.superClass.initialize.call(self);
            self.limit = options.limit;

            self.bubble = options.bubble;
            self.isCustom = options.isCustom;
			self.enable2 = true;
			self.state2 = false;
			self.hasMove2 = false;
			self.fx = self.fy = -1;
			self.x2 = self.y2 = self.mx2 = self.my2 = self.px2 = self.py2 = self.cx2 = self.cy2 = 0;
			self.node2 = $.type(node) == 'string' ? $(node) : node;
			self.container2 = options.container || self.node2.parent();
			self.fixed2 = self.node2.css('position').toLowerCase() == 'fixed';
			self.handler2 = $.type(handler) == 'string' ? $(handler) : handler;

			//init
            var h = self.handler2 || self.node2;

			function onDown(e) {
				e.preventDefault();

				if(!self.bubble || e.target == h[0]) {
					self.start(e);
					if (h[0].setCapture) {
						h[0].setCapture();
					}
				}
			}
			h.bind('mousedown', onDown);
			function onUp(e) {
				//e.preventDefault();
				if(self.state2) {
					self.state2 = false;
					var x = e.pageX - self.mx2 + self.x2 - self.px2,
						y = e.pageY - self.my2 + self.y2 - self.py2;
					if(self.fixed2) {
						x -= win.scrollLeft();
						y -= win.scrollTop();
					}
					if(self.limit) {
                        x = Math.max(x, self.cx2 - self.px2);
                        y = Math.max(y, self.cy2 - self.py2);
                        x = Math.min(x, self.cWidth - (self.px2 - self.cx2) - self.dWidth);
                        y = Math.min(y, self.cHeight - (self.py2 - self.cy2) - self.dHeight);
					}
					self.x2 = self.node2.offset().left;
					self.y2 = self.node2.offset().top;
					self.trigger('drag:end', [x, y, e.pageX, e.pageY, self.node2, self.container2]);
				}
				$(document).unbind('selectstart', selectListener);
				if (h[0].releaseCapture) {
					h[0].releaseCapture();
				}
			}
			$(document).bind('mouseup', onUp);
			function onMove(e) {
				//e.preventDefault();
				if(self.state2 && self.enable2) {
					if(!self.hasMove() && e.pageX == self.fx && e.pageY == self.fy) {
						//chrome下有几率发生尚未移动就触发了mousemove
					} else {
						self.hasMove2 = true;
					}
					var x = e.pageX - self.mx2 + self.x2 - self.px2,
						y = e.pageY - self.my2 + self.y2 - self.py2;
					if(self.fixed2) {
						x -= win.scrollLeft();
						y -= win.scrollTop();
					}
					if(self.limit) {
                        x = Math.max(x, self.cx2 - self.px2);
                        y = Math.max(y, self.cy2 - self.py2);
                        x = Math.min(x, self.cWidth - (self.px2 - self.cx2) - self.dWidth);
                        y = Math.min(y, self.cHeight - (self.py2 - self.cy2) - self.dHeight);
					}
					if (!self.isCustom) {
						self.node2.css({
							left: x,
							top: y
						});
					}
					//清理文本选中
					clearSelection();
					self.trigger('drag:move', [x, y, e.pageX, e.pageY, self.node2, self.container2]);
				}
			}
			$(document).bind('mousemove', onMove);

			//清除侦听方法，防止内存泄?
			self.cancel = function() {
				h.unbind('mousedown', onDown);
				$(document).unbind('mouseup', onUp);
				$(document).unbind('mousemove', onMove);
			}
		},
		start: function(e) {
			var self = this;
			$(document).bind('selectstart', selectListener);
			
			self.offsetParent2 = self.node2.offsetParent();
			
            if (self.limit) {
                self.cWidth = self.container2.outerWidth();
                self.cHeight = self.container2.outerHeight();
				self.pWidth = self.offsetParent2.outerWidth();
                self.pHeight = self.offsetParent2.outerHeight();
                self.dWidth = self.node2.outerWidth();
                self.dHeight = self.node2.outerHeight();
            }

			self.fx = e.pageX;
			self.fy = e.pageY;
			self.cx2 = self.container2.offset().left;
			self.cy2 = self.container2.offset().top;
			self.px2 = self.offsetParent2.offset().left;
			self.py2 = self.offsetParent2.offset().top;
			self.x2 = self.node2.offset().left;
			self.y2 = self.node2.offset().top;
			self.mx2 = e.pageX;
			self.my2 = e.pageY;
			self.state2 = true;
			self.trigger('drag:start', [self.x2, self.y2, e.pageX, e.pageY, self.node2, self.container2]);
			return this;
		},
		enable: function() {
			this.enable2 = true;
			return this;
		},
		disable: function() {
			this.enable2 = false;
			return this;
		},
		state: function() {
			return this.state2;
		},
		hasMove: function() {
			return this.hasMove2;
		}
	});

	return Klass;
});

/* @source tui/art.js */;

/*!
 * artTemplate - Template Engine
 * https://github.com/aui/artTemplate
 * Released under the MIT, BSD, and GPL Licenses
 */

define('tui/art',[], function() {

var global = window;

/**
 * 模板引擎
 * 若第二个参数类型为 String 则执行 compile 方法, 否则执行 render 方法
 * @name    template
 * @param   {String}            模板ID
 * @param   {Object, String}    数据或者模板字符串
 * @return  {String, Function}  渲染好的HTML字符串或者渲染方法
 */
var template = function (id, content) {
    return template[
        typeof content === 'string' ? 'compile' : 'render'
    ].apply(template, arguments);
};


template.version = '2.0.2';
template.openTag = '<%';     // 设置逻辑语法开始标签
template.closeTag = '%>';    // 设置逻辑语法结束标签
template.isEscape = true;    // HTML字符编码输出开关
template.isCompress = false; // 剔除渲染后HTML多余的空白开关
template.parser = null;      // 自定义语法插件接口



/**
 * 渲染模板
 * @name    template.render
 * @param   {String}    模板ID
 * @param   {Object}    数据
 * @return  {String}    渲染好的HTML字符串
 */
template.render = function (id, data) {

    var cache = template.get(id) || _debug({
        id: id,
        name: 'Render Error',
        message: 'No Template'
    });

    return cache(data);
};



/**
 * 编译模板
 * 2012-6-6 @TooBug: define 方法名改为 compile，与 Node Express 保持一致
 * @name    template.compile
 * @param   {String}    模板ID (可选，用作缓存索引)
 * @param   {String}    模板字符串
 * @return  {Function}  渲染方法
 */
template.compile = function (id, source) {

    var params = arguments;
    var isDebug = params[2];
    var anonymous = 'anonymous';

    if (typeof source !== 'string') {
        isDebug = params[1];
        source = params[0];
        id = anonymous;
    }


    try {

        var Render = _compile(id, source, isDebug);

    } catch (e) {

        e.id = id || source;
        e.name = 'Syntax Error';

        return _debug(e);

    }


    function render (data) {

        try {

            return new Render(data, id) + '';

        } catch (e) {

            if (!isDebug) {
                return template.compile(id, source, true)(data);
            }

            return _debug(e)();

        }

    }


    render.prototype = Render.prototype;
    render.toString = function () {
        return Render.toString();
    };


    if (id !== anonymous) {
        _cache[id] = render;
    }


    return render;

};



var _cache = template.cache = {};




// 辅助方法集合
var _helpers = template.helpers = (function () {

    var toString = function (value, type) {

        if (typeof value !== 'string') {

            type = typeof value;
            if (type === 'number') {
                value += '';
            } else if (type === 'function') {
                value = toString(value.call(value));
            } else {
                value = '';
            }
        }

        return value;

    };


    var escapeMap = {
        "<": "&#60;",
        ">": "&#62;",
        '"': "&#34;",
        "'": "&#39;",
        "&": "&#38;"
    };


    var escapeHTML = function (content) {
        return toString(content)
        .replace(/&(?![\w#]+;|#\d+)|[<>"']/g, function (s) {
            return escapeMap[s];
        });
    };


    var isArray = Array.isArray || function (obj) {
        return ({}).toString.call(obj) === '[object Array]';
    };


    var each = function (data, callback) {
        if (isArray(data)) {
            for (var i = 0, len = data.length; i < len; i++) {
                callback.call(data, data[i], i, data);
            }
        } else {
            for (i in data) {
                callback.call(data, data[i], i);
            }
        }
    };


    return {

        $include: template.render,

        $string: toString,

        $escape: escapeHTML,

        $each: each

    };
})();




/**
 * 添加模板辅助方法
 * @name    template.helper
 * @param   {String}    名称
 * @param   {Function}  方法
 */
template.helper = function (name, helper) {
    _helpers[name] = helper;
};




/**
 * 模板错误事件
 * @name    template.onerror
 * @event
 */
template.onerror = function (e) {
    var message = 'Template Error\n\n';
    for (var name in e) {
        message += '<' + name + '>\n' + e[name] + '\n\n';
    }

    if (global.console) {
        console.error(message);
    }
};







// 获取模板缓存
template.get = function (id) {

    var cache;

    if (_cache.hasOwnProperty(id)) {
        cache = _cache[id];
    } else if ('document' in global) {
        var elem = document.getElementById(id);

        if (elem) {
            var source = elem.value || elem.innerHTML;
            cache = template.compile(id, source.replace(/^\s*|\s*$/g, ''));
        }
    }

    return cache;
};



// 模板调试器
var _debug = function (e) {

    template.onerror(e);

    return function () {
        return '{Template Error}';
    };
};



// 模板编译器
var _compile = (function () {


    // 数组迭代
    var forEach = _helpers.$each;


    // 静态分析模板变量
    var KEYWORDS =
        // 关键字
        'break,case,catch,continue,debugger,default,delete,do,else,false'
        + ',finally,for,function,if,in,instanceof,new,null,return,switch,this'
        + ',throw,true,try,typeof,var,void,while,with'

        // 保留字
        + ',abstract,boolean,byte,char,class,const,double,enum,export,extends'
        + ',final,float,goto,implements,import,int,interface,long,native'
        + ',package,private,protected,public,short,static,super,synchronized'
        + ',throws,transient,volatile'

        // ECMA 5 - use strict
        + ',arguments,let,yield'

        + ',undefined';

    var REMOVE_RE = /\/\*[\w\W]*?\*\/|\/\/[^\n]*\n|\/\/[^\n]*$|"(?:[^"\\]|\\[\w\W])*"|'(?:[^'\\]|\\[\w\W])*'|[\s\t\n]*\.[\s\t\n]*[$\w\.]+/g;
    var SPLIT_RE = /[^\w$]+/g;
    var KEYWORDS_RE = new RegExp(["\\b" + KEYWORDS.replace(/,/g, '\\b|\\b') + "\\b"].join('|'), 'g');
    var NUMBER_RE = /^\d[^,]*|,\d[^,]*/g;
    var BOUNDARY_RE = /^,+|,+$/g;

    var getVariable = function (code) {
        return code
        .replace(REMOVE_RE, '')
        .replace(SPLIT_RE, ',')
        .replace(KEYWORDS_RE, '')
        .replace(NUMBER_RE, '')
        .replace(BOUNDARY_RE, '')
        .split(/^$|,+/);
    };


    return function (id, source, isDebug) {

        var openTag = template.openTag;
        var closeTag = template.closeTag;
        var parser = template.parser;


        var code = source;
        var tempCode = '';
        var line = 1;
        var uniq = {$data:1,$id:1,$helpers:1,$out:1,$line:1};
        var prototype = {};


        var variables = "var $helpers=this,"
        + (isDebug ? "$line=0," : "");

        var isNewEngine = ''.trim;// '__proto__' in {}
        var replaces = isNewEngine
        ? ["$out='';", "$out+=", ";", "$out"]
        : ["$out=[];", "$out.push(", ");", "$out.join('')"];

        var concat = isNewEngine
            ? "if(content!==undefined){$out+=content;return content;}"
            : "$out.push(content);";

        var print = "function(content){" + concat + "}";

        var include = "function(id,data){"
        +     "data=data||$data;"
        +     "var content=$helpers.$include(id,data,$id);"
        +     concat
        + "}";


        // html与逻辑语法分离
        forEach(code.split(openTag), function (code, i) {
            code = code.split(closeTag);

            var $0 = code[0];
            var $1 = code[1];

            // code: [html]
            if (code.length === 1) {

                tempCode += html($0);

            // code: [logic, html]
            } else {

                tempCode += logic($0);

                if ($1) {
                    tempCode += html($1);
                }
            }


        });



        code = tempCode;


        // 调试语句
        if (isDebug) {
            code = "try{" + code + "}catch(e){"
            +       "throw {"
            +           "id:$id,"
            +           "name:'Render Error',"
            +           "message:e.message,"
            +           "line:$line,"
            +           "source:" + stringify(source)
            +           ".split(/\\n/)[$line-1].replace(/^[\\s\\t]+/,'')"
            +       "};"
            + "}";
        }


        code = variables + replaces[0] + code
        + "return new String(" + replaces[3] + ");";


        try {

            var Render = new Function("$data", "$id", code);
            Render.prototype = prototype;

            return Render;

        } catch (e) {
            e.temp = "function anonymous($data,$id) {" + code + "}";
            throw e;
        }




        // 处理 HTML 语句
        function html (code) {

            // 记录行号
            line += code.split(/\n/).length - 1;

            // 压缩多余空白与注释
            if (template.isCompress) {
                code = code
                .replace(/[\n\r\t\s]+/g, ' ')
                .replace(/<!--.*?-->/g, '');
            }

            if (code) {
                code = replaces[1] + stringify(code) + replaces[2] + "\n";
            }

            return code;
        }


        // 处理逻辑语句
        function logic (code) {

            var thisLine = line;

            if (parser) {

                 // 语法转换插件钩子
                code = parser(code);

            } else if (isDebug) {

                // 记录行号
                code = code.replace(/\n/g, function () {
                    line ++;
                    return "$line=" + line +  ";";
                });

            }


            // 输出语句. 转义: <%=value%> 不转义:<%==value%>
            if (code.indexOf('=') === 0) {

                var isEscape = code.indexOf('==') !== 0;

                code = code.replace(/^=*|[\s;]*$/g, '');

                if (isEscape && template.isEscape) {

                    // 转义处理，但排除辅助方法
                    var name = code.replace(/\s*\([^\)]+\)/, '');
                    if (
                        !_helpers.hasOwnProperty(name)
                        && !/^(include|print)$/.test(name)
                    ) {
                        code = "$escape(" + code + ")";
                    }

                } else {
                    code = "$string(" + code + ")";
                }


                code = replaces[1] + code + replaces[2];

            }

            if (isDebug) {
                code = "$line=" + thisLine + ";" + code;
            }

            getKey(code);

            return code + "\n";
        }


        // 提取模板中的变量名
        function getKey (code) {

            code = getVariable(code);

            // 分词
            forEach(code, function (name) {

                // 除重
                if (!uniq.hasOwnProperty(name)) {
                    setValue(name);
                    uniq[name] = true;
                }

            });

        }


        // 声明模板变量
        // 赋值优先级:
        // 内置特权方法(include, print) > 私有模板辅助方法 > 数据 > 公用模板辅助方法
        function setValue (name) {

            var value;

            if (name === 'print') {

                value = print;

            } else if (name === 'include') {

                prototype["$include"] = _helpers['$include'];
                value = include;

            } else {

                value = "$data." + name;

                if (_helpers.hasOwnProperty(name)) {

                    prototype[name] = _helpers[name];

                    if (name.indexOf('$') === 0) {
                        value = "$helpers." + name;
                    } else {
                        value = value
                        + "===undefined?$helpers." + name + ":" + value;
                    }
                }


            }

            variables += name + "=" + value + ",";
        }


        // 字符串转义
        function stringify (code) {
            return "'" + code
            // 单引号与反斜杠转义
            .replace(/('|\\)/g, '\\$1')
            // 换行符转义(windows + linux)
            .replace(/\r/g, '\\r')
            .replace(/\n/g, '\\n') + "'";
        }


    };
})();

return template;

});

/* @source tui/widget.js */;


define('tui/widget', [
  "tui/event",
  "tui/art"
], function(Event, Art) {

	// 分割 event key
	function splitEventKey(eventKey, defaultEventType) {
		var type;
		var selector;
		var arr = eventKey.split(' ');
		if (arr.length == 1) {
			type = defaultEventType;
			selector = eventKey;
		} else {
			type = arr.shift();
			selector = arr.join(' ');
		}
		return [type, selector];
	}

	var Widget = Event.extend({
		// 与 widget 关联的 DOM 元素 (jQuery对象)
		element : null,
		// 默认模板
		template : '<div></div>',
		// 默认事件类型
		eventType : 'click',
		// 默认数据
		model : {},
		// 事件代理，格式为：
		// {
		//     'mousedown .title': 'edit',
		//     'click .open': function(ev) { ... }
		// }
		events : {},
		// 组件的定位节点 (jQuery对象)
		targetNode : $(document.body),
		// 渲染方法，"append","prepend","before","after","replaceWith"
		renderMethod : 'append',
		// 构造方法
		initialize : function(config) {
			var self = this;
			config = config || {};
			Widget.superClass.initialize.call(self);

			self.model = $.extend(true, {}, self.model);
			self.events = $.extend(true, {}, self.events);

			$.each(['element', 'targetNode'], function() {
				(typeof config[this] !== 'undefined') && (self[this] = $(config[this]));
			});

			$.each(['template', 'eventType', 'renderMethod'], function() {
				(typeof config[this] !== 'undefined') && (self[this] = config[this]);
			});

			$.each(['model', 'events'], function() {
				(typeof config[this] !== 'undefined') && $.extend(self[this], config[this]);
			});
		},

		// 在 this.element 内寻找匹配节点
		find : function(selector) {
			return this.element.find(selector);
		},

		// 注册事件代理
		delegate : function(events, handler) {
			var self = this;
			// 允许使用：widget.delegate('click p', function(ev) { ... })
			if ($.type(events) == 'string' && $.isFunction(handler)) {
				var obj = {};
				obj[events] = handler;
				events = obj;
			}
			// key 为 'event selector'
			$.each(events, function(key, val) {
				var callback = function(e) {
					if ($.isFunction(val)) {
						return val.call(self, e);
					} else {
						return self[val](e);
					}
				};
				var arr = splitEventKey(key, self.eventType);
				self.element.on(arr[0], arr[1], callback);
			});
			return self;
		},

		// 卸载事件代理
		undelegate : function(eventKey) {
			var self = this;
			// key 为 'event selector'
			var arr = splitEventKey(eventKey, self.eventType);
			self.element.off(arr[0], arr[1]);
			return self;
		},

		// 将 widget 渲染到页面上
		render : function(model) {
			var self = this;

			if (!self.element || !self.element[0]) {
				// self.element = $(Template.convertTpl(self.template, $.extend({getUrl: this.getUrl || getUrl}, model || self.model)));
				self.element = $(Art.compile(self.template)($.extend({getUrl: this.getUrl || getUrl}, model || self.model)));
			}

			self.delegate(self.events);

			if (self.renderMethod) {
				self.targetNode[self.renderMethod](self.element);
			}

			self.trigger('render:success', []);
			return self;
		},
		update: function(data){
			if (this.renderMethod) {
				// this.targetNode[this.renderMethod](Template.convertTpl(this.template, $.extend({getUrl: this.getUrl || getUrl}, data)));
				this.targetNode[this.renderMethod](Art.compile(this.template)($.extend({getUrl: this.getUrl || getUrl}, data)));
				self.trigger('update:success', []);
			}
		}
	});
	
	function getUrl(url){
		return url;
	}
	
	return Widget;

});

/* @source tui/mask.js */;


define('tui/mask', [], function() {
	var $node = $('<div class="tui_mask">');
	var init;
	var $win = $(window);
	var $doc = $(document);
	var $body = $(document.body);
	var ie6 = $.browser.msie && $.browser.version < 7;
	var ieMaxHeight = 4096;

	function cb() {
		var width = Math.max($win.width(), $doc.width());
		var height = Math.max($win.height(), $doc.height());
		var position = 'absolute';
		var top = 0;

		// Bugfix: http://jira.intra.tudou.com/browse/FLASH-3072
		if ($.browser.msie && height > ieMaxHeight) {
			if (!ie6) {
				position = 'fixed';
			} else {
				top = $win.scrollTop();
				if (top + ieMaxHeight > height) {
					top = height - ieMaxHeight;
				}
			}
			height = ieMaxHeight;
		}

		$node.css({
			position : position,
			top : top,
			width: width,
			height: height
		});
	}

	return {
		node: function() {
			return $node;
		},
		resize: function() {
			cb();
		},
		show: function(zIndex) {
			$win.bind('resize', cb);
			if (ie6) {
				$win.bind('scroll', cb);
			}
			$node.css('z-index', zIndex || 90000);
			this.resize();
			if(!init) {
				$body.append($node);
				init = true;
			}
			else
				$node.show();
			return this;
		},
		hide: function(remove) {
			$win.unbind('resize', cb);
			if (ie6) {
				$win.unbind('scroll', cb);
			}
			if(remove) {
				$node.remove();
				init = false;
			}
			else
				$node.hide();
			return this;
		},
		update: function() {
			cb();
		},
		state: function() {
			return $node.is(':visible');
		}
	};
});

/* @source tui/browser.js */;


define('tui/browser', [], function() {

	var userAgent = navigator.userAgent.toLowerCase();

	// userAgent = 'Mozilla/5.0 (iPod; CPU iPhone OS 6_0_1 like Mac OS X) AppleWebKit/536.26 (KHTML, like Gecko) Mobile/10A523'.toLowerCase();
	// userAgent = 'Mozilla/5.0 (Linux; U; Android 4.0.3; zh-cn; N12 Build/IML74K) AppleWebKit/534.30 (KHTML, like Gecko) Version/4.0 Safari/534.30'.toLowerCase();
	// userAgent = 'Mozilla/5.0 (compatible; MSIE 9.0; Windows Phone OS 7.5; Trident/5.0; IEMobile/9.0; NOKIA; Nokia 710)'.toLowerCase();
	// userAgent = 'Mozilla/5.0 (compatible; MSIE 10.0; Windows NT 6.2; WOW64; Trident/6.0; Touch)';

	var browserUA = {
		ie6 : $.browser.msie && $.browser.version == 6.0,
		// html5相关特性
		html5: function(){
			var input = document.createElement('input');
			var video = document.createElement('video');
			return {
				// 支持video标签，支持h264
				'h264': !!(video.canPlayType && video.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"').replace(/no/, '')),
				'history': !!(window.history && window.history.pushState && window.history.popState),
				'placeholder': "placeholder" in input
			};
		},
		//语言特性
		lang: (navigator.language || navigator.systemLanguage).toLowerCase(),
		iOS: (userAgent.match(/(ipad|iphone|ipod)/) || [])[0],
		iOSVersion: (userAgent.match(/os\s+([\d_]+)\s+like\s+mac\s+os/) || [0,'0_0_0'])[1].split('_'),
		wphone: parseFloat((userAgent.match(/windows\sphone\s(?:os\s)?([\d.]+)/) || ['','0'])[1]),
		android: parseFloat((userAgent.match(/android[\s|\/]([\d.]+)/) || ['','0'])[1])

	};

	// 检测UA及设备陀螺仪旋转值判断是否为移动设备
	browserUA.isMobile = !!browserUA.iOS || !!browserUA.wphone || !!browserUA.android || (window.orientation !== undefined) || false;

	// 检测移动设备是否为平板
	browserUA.isPad = browserUA.isMobile && (browserUA.iOS == 'ipad' || userAgent.indexOf('mobile') == -1 || (userAgent.indexOf('windows nt') != -1 && userAgent.indexOf('touch') != -1)) || false;

	return browserUA;
});

/* @source tui/dialog.js */;


define('tui/dialog', [
  "tui/browser",
  "tui/art",
  "tui/mask",
  "tui/widget",
  "tui/drag"
], function(Browser, Art, Mask, Widget, Drag) {

	var win = $(window);

	var ie67 = ($.browser.msie && $.browser.version <= 7) || !$.support.boxModel;

	var zIndex = 10002;

	var buttonsTemplate = '<div class="tui_dialog_button"><% for (var i = 0; i < buttons.length; i++) { %>'
		+ '<a data-role="button_<%=i%>" href="#" <%if(buttons[i].className){%>class="<%=buttons[i].className%>"<%}%>><%=buttons[i].name%></a>'
		+ '<% } %></div>';

	var template = '<div class="tui_dialog <%=className%>"><div<% if (hasWrap) { %> class="tui_dialog_wrap"<% } %>><div class="tui_dialog_holder" data-role="holder">'
		+ '<div class="tui_dialog_resize"></div>'
		+ '<div class="tui_dialog_w_tp"></div><div class="tui_dialog_w_bm"></div>'
		+ '<div class="tui_dialog_w_lf"></div><div class="tui_dialog_w_rt"></div>'
		+ '<div class="tui_dialog_w_tl"></div><div class="tui_dialog_w_tr"></div>'
		+ '<div class="tui_dialog_w_bl"></div><div class="tui_dialog_w_br"></div>'
		+ '<div class="tui_dialog_header" data-role="header"><span class="tui_dialog_close" data-role="close" title="关闭">X</span>'
		+ '<div class="tui_dialog_title" data-role="title"><%=title%></div><div class="tui_dialog_bar"><%=bar%></div></div>'
		+ '<div class="tui_dialog_content" data-role="content"></div>'
		+ '<% if (buttons.length > 0) { %><div class="tui_dialog_footer" data-role="footer">' + buttonsTemplate + '</div><% } %>'
		+ '<% if (info) { %><div class="tui_dialog_info"><%=info%></div><% } %>'
		+ '</div></div></div>';

	var Dialog = Widget.extend({
		// 事件代理
		events : {
			'click [data-role=close]' : function(e) {
				e.preventDefault();
				this.close();
			}
		},
		// 构造方法
		initialize : function(config) {
			var self = this;

			var defaults = {
				template : template,
				buttons : [],
				zIndex : zIndex,
				hasDrag : true,
				hasMask : true,
				isFixed : true
			};

			config = $.extend(defaults, config || {});

			zIndex = config.zIndex;

			var hasWrap = $.browser.msie && parseFloat($.browser.version) < 9;
			if (typeof config.hasWrap != 'undefined') {
				hasWrap = config.hasWrap;
			}

			var data = {
				hasWrap : hasWrap,
				className : config.className || 'tudou_dialog',
				title : config.title || '',
				bar : config.bar || '',
				info : config.info || '',
				buttons : config.buttons
			};
			config.element = $(Art.compile(config.template)(data));

			Dialog.superClass.initialize.call(this, config);

			self.dom = {
				holder : self.element.find('[data-role=holder]'),
				header : self.element.find('[data-role=header]'),
				title : self.element.find('[data-role=title]'),
				content : self.element.find('[data-role=content]'),
				footer : self.element.find('[data-role=footer]'),
				close : self.element.find('[data-role=close]')
			};

			self.config = config;

			self.open();

			var keyDownCallBack = function(e){
				if(e.keyCode == 27){ // Esc
					self.close();
					$(document).unbind('keydown', keyDownCallBack);
				}
			}
			$(document).keydown(keyDownCallBack);
		},
		title : function(html) {
			this.dom.title.html(html);
			return this;
		},
		content : function(html) {
			this.dom.content.html(html);
			return this;
		},
		open : function() {
			var self = this;
			var config = self.config;
			var element = self.element;
			var dom = self.dom;

			// 设置面板层叠索引值
			element.css('z-index', zIndex);
			zIndex += 2;

			if (config.hasMask) {
				Mask.show(element.css('z-index') - 1);
			}

			element.css('position', (ie67 || !config.isFixed) ? 'absolute' : 'fixed');

			self.iframeMask = $('<iframe>', {
				src: "about:blank",
				frameborder: 0,
				css: {
					border : 'none',
					'z-index' : -1,
					position : 'absolute',
					top : 0,
					left : 0,
					width : '100%',
					height : '100%'
				}
			}).prependTo(dom.holder);

			// dom生成后再写入内容，防止内容中的flash被重置
			self.content(config.content || '');

			$.each(config.buttons, function(i) {
				self.events['[data-role=button_' + i + ']'] = this.callback;
			});

			if (!self.element.parent()[0]) {
				self.render();
			}

			self.element.show();

			self.locate();

			self.resizeLocate = function(e) {
				self.locate();
			};
			win.bind('resize', self.resizeLocate);

			if (ie67 && config.isFixed) {
				self.iefixScroll = function(e) {
					self.locate();
				};
				win.bind('scroll', self.iefixScroll);

				self.iframeMask.css({
					height: dom.holder.height()
				});
			}

			if (self.config.hasDrag) {
				new Drag(element, {
					handler : dom.header,
					limit : true
				});
			}

			return self;
		},
		close : function(isHide) {
			var self = this;

			if (self.config.hasMask) {
				Mask.hide(true);
			}

			self.trigger('close', [self]);

			if(!isHide) {
				self.element.find('iframe').remove();
			}
			self.element[isHide ? 'hide' : 'remove']();

			if (self.resizeLocate) {
				win.unbind('resize', self.resizeLocate);
			}

			if (self.iefixScroll) {
				win.unbind('scroll', self.iefixScroll);
				self.iefixScroll = null;
			}

			return self;
		},
		locate: function() {
			var self = this;
			var left = Math.max(0, (win.width() - self.element.width()) >> 1);
            if (!self.config.isFixed) {
                var top = win.scrollTop() + (win.height() - self.element.height()) / 2;
            } else {
                var top = (Math.max(0, (win.height() - self.element.height()) >> 1)) + (ie67 ? win.scrollTop() : 0);
            }
			self.element.css({
				left : left,
				top : top
			});
			return self;
		}
	});

	Dialog.confirm = function(msg, callback) {
		var op = {};
		if ($.isPlainObject(msg)) {
			op = msg;
			msg = op.msg;
			callback = op.callback;
		}
		return new Dialog($.extend({
			className: 'tudou_dialog alert',
			title: '提示',
			content: '<div class="tui_dialog_text">' + msg + '</div>',
			hasMask: true,
			buttons: [{
				name: '确定',
				callback: function(e){
					e.preventDefault();
					callback && callback.call(this);
					this.close();
				}
			}, {
				name: '取消',
				callback: function(e){
					e.preventDefault();
					this.close();
				}
			}]
		}, op));
	};

	Dialog.alert = function(msg, callback) {
		var op = {};
		if ($.isPlainObject(msg)) {
			op = msg;
			msg = op.msg;
			callback = op.callback;
		}
		return new Dialog($.extend({
			className: 'tudou_dialog alert',
			title: '提示',
			content: '<div class="tui_dialog_text">' + msg + '</div>',
			hasMask: true,
			buttons: [{
				name: '确定',
				callback: function(e){
					e.preventDefault();
					callback && callback.call(this);
					this.close();
				}
			}]
		}, op));
	};

	return Dialog;
});

/* @source app/login.js */;

define("app/login", [
  "tui/event",
  "tui/art",
  "tui/dialog",
  "tui/html5form",
], function( Event, Art, Dialog, Html5form, require, exports){
	
	var Login = new Event();
	var codeSucc;
	var loginArt = Art.compile('<h3>登录</h3>\n<a href="#" class="close" data-role="close">X</a>\n<form id="loginForm">\n<div class="l"><input class="tel" name="name" type="text" placeholder="用户名" /></div>\n<div class="l"><input class="pwd" name="pwd" type="password" placeholder="密码" /></div>\n<div class="l"><input class="codeipt" name="code" type="text" placeholder="验证码" /><img src="get_code.php?load=yes&id=<%=code%>&<%=t%>" codeId="<%=code%>" class="code" /></div>\n<div class="btn">\n<a class="submit" href="#">登 录</a>\n</div>\n</form>');

	function noop(){}

	Login.needLogin = function(node, callback) {
		if(typeof node === 'function'){
			callback = node;
			node = null;
		}else{
			node = node || null;
		}

		if(node){
			var $content = $(node);
		}else{
			var code = $('#gCodeID').val();
			var dlg = new Dialog({
				className : 'login_dialog',
				content : loginArt({code: code, t : Math.random()})
			});

			var $content = dlg.dom.content;	
		}


		var $form = $content.find('form');
		var $tel = $form.find('[name=name]');
		var $pwd = $form.find('[name=pwd]');
		var $code = $form.find('[name=code]');

		var h5form = new Html5form($form, Html5form.VALID_BLUR);
		var params = {};

		$content.on('click', '.submit', function(e){
			e.preventDefault();
			var name = $tel.val().trim();

			if(!name.length){
				h5form.tip($tel, '请填写正确的用户名');
				return;
			}

			var pwd = $pwd.val().trim();
			if(!pwd.length){
				h5form.tip($pwd, '请输入密码');
				return;
			}
			if(!!codeSucc){
				h5form.tip($code, '请输入正确的验证码');
				return;
			}

			var params = $form.serialize();

			params += '&act=login';

			$.post('login.php', params, function(res){

				if(res == 1){
					callback && callback();
				}else{
					Dialog.alert('用户名或者密码不正确');
					getCode();
				}

			});

		}).on('click', '.code', function(e){
			e.preventDefault();

			getCode();
		});

		function getCode(){

			var code = $form.find('.code');

			code.attr('src', 'get_code.php?load=yes&id=' + code.attr('codeId') + '&' + Math.random());	
		}

		$code.on('input', function(){

			var me =  $(this);
			var val = me.val();
			var code = $form.find('.code');

			if(val.length == 5){

				$.post('check.php', { act: 'code', v: val , id: code.attr('codeId') }, function(res) {
					codeSucc = res == 1;

					if(!codeSucc){
						h5form.tip(me, '验证码无效');
						getCode();
						
					}

				}, 'json');

			}

		});
	};

	return Login;

});
/* @source tui/scrollLoader.js */;

﻿define('tui/scrollLoader', [], function() {

	var win = $(window),
		height = win.height(),
		queue = [],
		m = {
			node: function(n, size) { //传入节点计算top值
				n = $(n);
				return this.y(n.offset() ? n.offset().top : 0, size ? n.outerHeight(true) : undefined);
			},
			y: function(py, ps) { //直接传入top值，第2个参数详见size，不设置时单向计算，只要在滚动条之上的都加载
				this._y = py;
				this._s = ps || 0;
				return this;
			},
			threshold: function(th) { //传入节点计算top值
				this._th = th;
				return this;
			},
			size: function(s) { //设置size时会计算滚出区域情况，在可视区域之外都不加载
				this._s = s;
				return this;
			},
			delay: function(d) { //仅size时有效，延迟加载可是区域内，防止滚动条瞬间拖拽情况
				this._d = d;
				return this;
			},
			time: function(t) { //多少时间后加载器必定执行
				var self = this;
				self._t = t;
				setTimeout(function() {
					self.start();
				}, t);
				return self;
			},
			load: function() { //加载回调
				this._cb = this._cb.concat(Array.prototype.slice.call(arguments, 0));
				this._no && queue.push(this);
				this._no = false;
				this._f && this.fire();
				this._f = false;
				return this;
			},
			start: function() { //开始加载并清空加载器
				this._enable && this._cb.forEach(function(cb) {
					cb();
				});
				return this.cancel();
			},
			cancel: function() { //永久取消此次延迟加载
				this.disable();
				for(var i = 0, len = queue.length; i < len; i++) {
					if(queue[i] == this) {
						queue.splice(i, 1);
						break;
					}
				}
			},
			enable: function() { //设置加载状态为可用
				this._enable = true;
				return this;
			},
			disable: function() { //设置加载状态为不可用
				this._enable = false;
				return this;
			},
			fire: function(top, he) { //手动尝试触发判断加载条件
				top = top || win.scrollTop();
				he = he || height;
				var self = this;
				if(self._s) {
					clearTimeout(self._timeout);
					self._timeout = setTimeout(function() {
						if(self._enable
							&& self._y <= (top + he + self._th)
							&& (self._y + self._s) >= (top - self._th)
						)
							cb();
					}, self._d);
				}
				else {
					if(this._enable
						&& this._y <= (top + he + this._th)
					)
						cb();
				}
				function cb() {
					self._cb.forEach(function(cb) {
						cb();
					});
					self.cancel();
				}
				return this;
			}
		},
		Klass = function() {
			this._y = 0; //y坐标值
			this._th = 0; //偏移量
			this._d = 0; //延迟
			this._s = 0; //尺寸，等于0的时候不侦听尺寸，即滚动条区域以上直接加载；否则判断是否在显示范围内
			this._cb = []; //回调
			this._no = true; //是否被加入侦听
			this._enable = true; //是否启用
			this._timeout = null; //延迟侦听器
			this._f = true; //首次调用状态，因为f5后一开始滚动条就有可能在下方，所以初期不onscroll也要调用
		},
		instance = {};
	Klass.prototype = m;

	function onScroll() {
		var top = win.scrollTop();
		queue.concat().forEach(function(o) {
			o.fire(top, height);
		});
	}
	win.bind('resize', function() {
		height = win.height();
		onScroll();
	});
	win.bind('scroll', onScroll);
	
	for(var i in m) {
		(function(key) {
			instance[key] = function() {
				var obj = new Klass;
				return obj[key].apply(obj, Array.prototype.slice.call(arguments, 0));
			};
		})(i);
	}
	return instance;

});

/* @source tui/lazyImageLoader.js */;

/*
 * 基于TUI.scrollLoader 图片分段延后加载
 * 默认对加classname为lazyImg的img标签进行延后替换处理
 */
define('tui/lazyImageLoader', [
  "tui/scrollLoader"
], function(scrollLoader){
	var imgs, size, attr, zone = {};

	function loadImage(op){
		op = op || {};

		size = op.size || 300;				// 图片分块区域大小
		attr = op.attr || 'alt';			// x
		imgs = op.imgs || $('img.lazyImg');	// 需要延后到图片对象

		/*for (var i = 0, l = imgs.length; i < l; i++) {
		 var img = imgs[i];
		 var top = $(img).offset().top>0 ? $(img).offset().top : 0 || $(img).parents(':visible').offset().top || 0;
		 // 图片按实际位置分段
		 addToZone(top, img);
		 }*/
		var optZone = [];
		imgs.each(function(){
			var $el = $(this),
				offset = $el.offset(),
				top = offset.top > 0 ? offset.top : ($el.parents(':visible') && $el.parents(':visible').offset()) ? $el.parents(':visible').offset().top : 0;
			addToZone(top, this, optZone);
		});
		for (var z in optZone) {
			if (optZone.hasOwnProperty(z)) {
				var images = $(optZone[z]);
				images.each(function(){
					var node = this;
					scrollLoader.y(z).threshold(size).load(function(){
						var _img = $(node);
						_img.attr('src', _img.attr(attr));
						_img.removeAttr(attr);
						if (_img[0].className.indexOf('lazyImg') !== -1) {
							_img.removeClass('lazyImg');
						}
					})

				});
			}
		}
	}

	function addToZone(top, img, optZone){
		top = top - top % size;
		//zone[top] = zone[top] || [];
		//zone[top].push(img);
		optZone[top] = optZone[top] || [];
		optZone[top].push(img);
	}

	return loadImage;
});

/* @source module/switchtab.js */;

/**
 * 全站Tab切换、滚动Banner
 */
define("module/switchtab", [
  "tui/lazyImageLoader",
  "tui/event"
], function(LazyImageLoader, Event) {
    /**
     * jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
     * @note jQuery动画方法的缓冲效果
     */
    jQuery.easing['jswing'] = jQuery.easing['swing'];
    jQuery.extend( jQuery.easing,{
        // t: current time, b: begInnIng value, c: change In value, d: duration
        easeInOutQuad: function (x, t, b, c, d) { //===easeInOutCubic
            if ((t/=d/2) < 1) return c/2*t*t*t + b;
            return c/2*((t-=2)*t*t + 2) + b;
        }
    });

    function getTabIndex(obj){
        if (obj && obj.tagName) {
            var me = (obj.tagName.toLowerCase() == 'a') ? $(obj) : $(obj).find('a');
            me = me.length ? me : $(obj);
            return (me.attr('rel') || me.attr('href').replace(/.*#(\d+)$/, '$1') || 1) - 1;
        } else {
            return 0;
        }
    }

    function clearTimer(timer){
        var args = arguments;
        for (var i = 0, l = args.length; i < l; i++) {
            var timer = args[i];
            if (timer) clearTimeout(timer);
        }
        return null;
    }
    
    
    var Klass = Event.extend({
        initialize: function(op) {          
            var self = this;
            Klass.superClass.initialize.apply(self, arguments); 
                
            self.op = op || {};
            self.op.slide = op.slide || false;
            self.op.linktab = op.linktab || false;
            self.op.clicktab = op.clicktab || false;
            self.op.lazyContent = op.lazyContent || window.gLazyContent || false;           
            
            // 界面对象
            var box = self.box = $(op.box);
            var tab = self.tab = $(op.tab || '.tab li', box);
            var panel = self.panel = $(op.panel || '.c', box);
        
            self.size = tab.length || panel.length;
            self.loop = op.loop || 0;
            self.current = getTabIndex(tab.filter('.current')[0]);
    
            // 横向滚动面板
            if (self.op.slide) {
                self.scroll = panel.parent().parent();
                // 滚动位置归零
                self.scroll.scrollLeft(0);
                // 复制第一个拼接
                LazyImageLoader({imgs: panel.eq(self.current).find('.lazyImg')});
                panel.parent().append(panel.eq(0).clone());
                self.panel = $(op.panel || '.c', box);
                // 滚动参数设置
                self.width = panel.width();
                self.delay = op.delay || 700;
                self.loop = (self.loop || 5000) + self.delay;
                self.anilock = false;
            }
    
            if (self.size < 2) return;
    
            // 可点击Tab
            if (self.op.clicktab) {
                tab.click(function(event){
                    event.preventDefault();
                    self.go(getTabIndex(this));
                });
            } else {
                // 非带链接Tab
                if (!self.op.linktab) {
                    tab.click(function(event){ event.preventDefault() });
                }
                tab.mouseenter(function(){
                    clearTimer(self.timer, self.looptimer);
                    var me = this;
                    self.timer = setTimeout(function(){
                        self.go(getTabIndex(me));
                    }, 30);
                }).mouseleave(function(){
                    clearTimer(self.timer, self.looptimer);
                    self.start();
                });
            }
    
            // 循环切换
            if (self.loop) {
                self.check(self.op.clicktab ? tab : null);
                self.start();
            }


            tab.parent().on('click', 'a', function(event){
                var href = $(this).attr('href');

                if( !href || href == '#' || href.length < 5){
                    event.preventDefault();
                    //return false;
                }
            });                 
        },
        
        on: function(type, o){
            this.box.eventProxy(type, o);
            return this;
        },

        go: function(cur, auto){
            var self = this;
            cur = auto ? cur : Math.min(Math.max(cur, 0), self.size - 1);
            self.trigger('before', [self.current, cur, self]);
            if (self.op.slide) {
                if (self.anilock) {
                    self.nextstep = function(){ self.animate(cur, auto); };
                    return;
                }
                self.animate(cur, auto);
            } else {
                var prev = self.current;
                                
                self.current = cur % self.size;
                self.trigger('change', [self.current, self]);
                self.tab.removeClass('current').eq(self.current).addClass('current');

                var isFade = self.op.fade;
                var panels = self.panel;
                
                isFade ? panels.eq(prev).stop().fadeOut(100): panels.hide();
                
                panels.eq(self.current)[isFade ? 'fadeIn' : 'show'](self.op.duration ? self.op.duration : '');
                self.trigger('after', [self.current, self]);
            }
        },
        prev: function(auto){
            this.go(this.current - 1, auto);
        },
        next: function(auto){
            this.go(this.current + 1, auto);
        },
        start: function(start){
            var self = this;
            if (self.loop) {
                clearTimer(self.looptimer);
                if (start) self.start();
                self.looptimer = setTimeout(function(){
                    self.start();
                    self.next(true);
                }, self.loop);
            }
        },
        stop: function(){
            clearTimer(this.looptimer);
        },
        check: function(obj){
            var self = this;
            (obj || self.panel).mouseenter(function(){
                clearTimer(self.looptimer);
            }).mouseleave(function(){
                clearTimer(self.looptimer);
                self.start();
            });
        },
        animate: function(pos, auto){
            var self = this;
            var current = self.current;
            if (self.anilock || current == pos) return;
            clearTimer(self.looptimer);
            var size = self.size, width = self.width, panel = self.panel, scroll = self.scroll;
            var s = current > pos ? 0 : width;
            var c = current > pos ? width : 0;
            pos = pos % (auto ? size + 1 : size);
            LazyImageLoader({imgs: panel.eq(pos).show().find('.lazyImg')});
            
            scroll.scrollLeft(c);
            self.tab.removeClass('current').eq(pos % size).addClass('current');
            scroll.animate({ scrollLeft: s }, self.delay, 'easeInOutQuad', function(){
                panel.eq(current).hide();
                if (auto && pos == size) {
                    pos = pos % size;
                    LazyImageLoader({imgs: panel.eq(0).show().find('.lazyImg')});
                    panel.eq(size).hide();
                }
                scroll.scrollLeft(0);
                self.current = pos;
                self.anilock = false;
                self.trigger('after', [self.current, self]);
                if (self.nextstep) {
                    self.nextstep();
                    self.nextstep = null;
                }
                if (auto) {
                    self.start();
                }
            });
            self.anilock = true;
        }       
        });

    
    return Klass;
});

/* @source app/form.js */;

define("app/form", [
  "tui/html5form",
  "tui/dialog",
  "tui/art"
], function(Html5form, Dialog, Art) {
	return function(node){

		var form = $(node).find('form');
		var h5form= new Html5form(form);
		var tipArt = Art.compile('\n注册成功，请保留下面的校验码，以便日后使用<br>\n<%=msg%><br>\n<a href="http://www.cnfashion.net/">继续浏览本站</a>\n');

		var name = form.find('[name=name]');
		var pwd = form.find('[name=pwd]');
		var tpwd = form.find('[name=tpwd]');
		var company = form.find('[name=company]');
		var linker = form.find('[name=linker]');
		var phone = form.find('[name=phone]');
		var email = form.find('[name=email]');
		var code = form.find('.code');
		var codeIpt = form.find('[name=code]');
		var codeSucc = false;
		var emailSucc = false;
		var nameSucc = false;

		form.on('click', '.btn-reg', function(e){
			e.preventDefault();

			if( !nameSucc ){
				h5form.tip(name, '用户名无效');
				return;
			}

			var pval = pwd.val();
			if(pval.length < 6 || !/[^\u4e00-\u9fa5]+/.test(pval)){
				h5form.tip(pwd, '至少输入六位数密码');
				return;
			}


			if(pval !== tpwd.val() ){
				h5form.tip(pwd, '输入的两次密码不一致');
				return;
			}

			if(company.length){

				if(company.val().trim().length < 2){
					h5form.tip(company, '请填写正确的名称');
					return;
				}

				if(!/^1[^2]\d{9}$/.test(phone.val().trim())){
					h5form.tip(phone, '手机格式不符合');
					return;
				}

				if(linker.val().trim().length < 2){
					h5form.tip(linker, '请填写正确的联系人');
					return;
				}
			}

			if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test( email.val().trim()) || !emailSucc){
				h5form.tip(email, '邮箱无效或已注册!');
				return;
			}

			if(!codeSucc){
				h5form.tip(codeIpt, '验证码无效');
				return;
			}

			var params = form.serialize();

			$.post('reg.php', params, function(res){

				if(res.code == 'success'){
					new Dialog({
						className : 'tip_dialog',
						content : tipArt({msg : res.msg})
					});

				}else{
					Dialog.alert(res.msg);
				}

			});

			// form.submit();

		}).on('click', '.code', function(e){
			e.preventDefault();
			getCode();
		});


		function getCode(){

			var code = $form.find('.code');

			code.attr('src', 'get_code.php?load=yes&id=' + code.attr('codeId') + '&' + Math.random());	
		}


		pwd.on('blur', function(){
			var me =  $(this);
			var val = me.val();

			if( !/[^\u4e00-\u9fa5]+/.test(val) || val.length < 6 ){
				h5form.tip(me, '输入至少6位的除汉字外的字符');
			}

		});

		tpwd.on('blur', function(){
			var me =  $(this);

			if(me.val().trim() !== pwd.val() ){
				h5form.tip(me, '两次输入的密码不一致');
			}

		});

		name.on('blur', function(){
			var me =  $(this);
			var val = me.val();
			
			if(val.length < 1){
				h5form.tip(me, '请填写账号名称');
				return;
			}

			$.post('check.php', { act: 'name', v: val }, function(res) {

				nameSucc = res == 1;

				if(!nameSucc){
					h5form.tip(me, '账号已存在！');
				}

			}, 'json');

		});

		email.on('blur', function(){
			var me =  $(this);
			var val = me.val();
			
			if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(val)){
				h5form.tip(me, '请填写邮箱');
				return;
			}

			$.post('check.php', { act: 'email', v: val}, function(res) {

				emailSucc = res == 1;
				if(!emailSucc){
					h5form.tip(me, '该邮箱已注册！');
				}

			}, 'json');

		});

		codeIpt.on('input', function(){

			var me =  $(this);
			var val = me.val();

			if(val.length == 5){

				$.post('check.php', { act: 'code', v: val , id: code.attr('codeId') }, function(res) {
					codeSucc = res == 1;

					if(!codeSucc){
						h5form.tip(me, '验证码无效');

						getCode();

					}

				}, 'json');

			}

		});

	}

});
/* @source app/share.js */;

define("app/share", [], function() {

	return function() {

		//http://share.baidu.com/code/advance
		window._bd_share_config = {
			"common": {
				"bdSnsKey": {},
				"bdText": "",
				"bdMini": "2",
				"bdPic": "",
				"bdStyle": "0",
				"bdSize": "16"
			},
			"share": {},
			"image": false,
			"selectShare": false
		};

		with(document) 0[(getElementsByTagName('head')[0] || body).appendChild(createElement('script')).src = 'http://bdimg.share.baidu.com/static/api/js/share.js?v=89860593.js?cdnversion=' + ~(-new Date() / 36e5)];

	}



});
/* @source app/nav.js */;

define("app/nav", [
  "tui/art",
  "app/login"
], function(Art, Login, require, exports) {
	

	function g_dropdown_toggle() {
		$('#header').on('mouseenter', '.icon-weixin', function() {
			$(this).find('.qrcode').css({display: 'inline-block'});
		}).on('mouseleave', '.share', function() {
			$(this).find('.qrcode').css({display: 'none'});
		});
	}
	
	// 跟随导航;
	function fixnav (op){
		op = $.extend({
			// force: false, //强制fixed 默认根据body高度来定
			top: 165, //距离顶部fixed 
			disabled: true //禁用fixed（默认关闭伴随）
		}, op);

		var $win = $(window);
		var winH = $win.height();
		var $nav = $('#header .m-nav');
		var barStatus = 0;
		var top = op.top;

		if(op.disabled){
			return;
		}

		var isTop = $win.scrollTop() <= top;

		if(!isTop){
			$nav.addClass('fixed');
			barStatus = 1;
		}

		$win.bind('scroll', function(){

			isTop = $win.scrollTop() <= top;
			if(!isTop && barStatus === 0){
				$nav.addClass('fixed');
				barStatus = 1;
			}
			if(isTop && barStatus === 1){
				$nav.removeClass('fixed');
				barStatus = 0;
			}
		});
	};




	exports.init = function(op) {
		// Login.autoLogin();

		fixnav(op);
		g_dropdown_toggle();

		$('#gUser').on('click', '[data-role=login]', function(e){
			e.preventDefault();
			Login.needLogin(function(){
				location.reload();
			});
		});

	};


});
/* @source  */;

require(['app/nav', 'app/share', 'app/form', 'module/switchtab', 'app/login'], function(Nav, Share, Regform, Switchtab, Login) {
	Nav.init({
		disabled: false
	});


	Share();

	var $albumShow = $('#albumShow');
	var newTab = new Switchtab({
		box : $albumShow,
		panel : 'li',
		slide: true,
		loop: 600000
	});	
	loadImg(0);
	loadImg(1);

	newTab.bind('before', function(prev, cur) {
		loadImg(cur);
		loadImg(cur + 1);
	});
	
	$albumShow.bind('mouseenter', function(){
		newTab.stop();
	}).bind('mouseleave', function(){
		newTab.start();
	});
	
	$albumShow.delegate('.next', 'click', function(e){
		e.preventDefault();
		var prev = newTab.current;

		if (prev > newTab.size) {
			alert('这已经是第一页了！')
		} else {
			newTab.next(true);
		}			
	}).delegate('.prev', 'click', function(e){
		e.preventDefault();
		var prev = newTab.current;
		
		if (prev < 1) {
			alert('这已经是最后一页了！')
		} else {
			newTab.prev(true);
		}				
	});

	function loadImg(index){

		var img = newTab.panel.eq(index).find('img');
		var src = img.attr('lazyImg');

		if(img.length && src){
			img.attr('src', src);
			img.removeAttr('lazyImg');
		}

	}

	var hList = [270, 909, 2365, 3398];
	var $win = $(window);
	$('.page-post').on('click', '.go', function(e){
		// e.preventDefault();

		var me = $(this);
		var sec =  hList[ me.attr('link')];

		if(!sec) return;
		$win.animate({
			scrollTop: sec
		}, 500);
	});

	$win.on('scroll', function(){
		var top = $win.scrollTop();

		$('.gotop')[top> 900 ? 'show' : 'hide']();

	});

	//注册
	$('#pageReg').on('click', '.btn', function(e){
		e.preventDefault();
		var self = $(this);

		if(self.hasClass('current')) return;

		self.addClass('current').siblings().removeClass('current');

		if(self.index() == 0){
			$('.form-enter').hide();
			$('.form-personal').show();
		}else{
			$('.form-enter').show();
			$('.form-personal').hide();
		}
	});

	Regform('.form-personal');
	Regform('.form-enter');



	$('.form-login').on('click', '.btn-login', function(e){
		e.preventDefault();

		Login.needLogin('.form-login', function(){

		});
	});


});

})(window.jQuery);

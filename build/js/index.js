/**
 * @modified $Author$
 * @version $Rev$
 */

(function($) {


require.config({ enable_ozma: true });


/* @source module/flexisel.js */;

/*
 * File: jquery.flexisel.js
 * Version: 1.0.0
 * Description: Responsive carousel jQuery plugin
 * Author: 9bit Studios
 * Copyright 2012, 9bit Studios
 * http://www.9bitstudios.com
 * Free to use and abuse under the MIT license.
 * http://www.opensource.org/licenses/mit-license.php
 */


define("module/flexisel", [], function() {
	(function($) {

		$.fn.flexisel = function(options) {

			var defaults = $.extend({
				visibleItems: 4,
				animationSpeed: 200,
				autoPlay: false,
				autoPlaySpeed: 3000,
				pauseOnHover: true,
				setMaxWidthAndHeight: false,
				enableResponsiveBreakpoints: false,
				responsiveBreakpoints: {
					portrait: {
						changePoint: 480,
						visibleItems: 1
					},
					landscape: {
						changePoint: 640,
						visibleItems: 2
					},
					tablet: {
						changePoint: 768,
						visibleItems: 3
					}
				}
			}, options);

			/******************************
		Private Variables
		*******************************/

			var object = $(this);
			var settings = $.extend(defaults, options);
			var itemsWidth; // Declare the global width of each item in carousel
			var canNavigate = true;
			var itemsVisible = settings.visibleItems;

			/******************************
		Public Methods
		*******************************/

			var methods = {

				init: function() {

					return this.each(function() {
						methods.appendHTML();
						methods.setEventHandlers();
						methods.initializeItems();
					});
				},

				/******************************
			Initialize Items
			*******************************/

				initializeItems: function() {

					var listParent = object.parent();
					var innerHeight = listParent.height();
					var childSet = object.children();

					var innerWidth = listParent.width(); // Set widths
					itemsWidth = (innerWidth) / itemsVisible;
					childSet.width(itemsWidth);
					childSet.last().insertBefore(childSet.first());
					childSet.last().insertBefore(childSet.first());
					object.css({
						'left': -itemsWidth
					});

					object.fadeIn();
					$(window).trigger("resize"); // needed to position arrows correctly

				},


				/******************************
			Append HTML
			*******************************/

				appendHTML: function() {

					object.addClass("nbs-flexisel-ul");
					object.wrap("<div class='nbs-flexisel-container'><div class='nbs-flexisel-inner'></div></div>");
					object.find("li").addClass("nbs-flexisel-item");

					if (settings.setMaxWidthAndHeight) {
						var baseWidth = $(".nbs-flexisel-item > img").width();
						var baseHeight = $(".nbs-flexisel-item > img").height();
						$(".nbs-flexisel-item > img").css("max-width", baseWidth);
						$(".nbs-flexisel-item > img").css("max-height", baseHeight);
					}

					$("<div class='nbs-flexisel-nav-left'></div><div class='nbs-flexisel-nav-right'></div>").insertAfter(object);
					var cloneContent = object.children().clone();
					object.append(cloneContent);
				},


				/******************************
			Set Event Handlers
			*******************************/
				setEventHandlers: function() {

					var listParent = object.parent();
					var childSet = object.children();
					var leftArrow = listParent.find($(".nbs-flexisel-nav-left"));
					var rightArrow = listParent.find($(".nbs-flexisel-nav-right"));

					$(window).on("resize", function(event) {

						methods.setResponsiveEvents();

						var innerWidth = $(listParent).width();
						var innerHeight = $(listParent).height();

						itemsWidth = (innerWidth) / itemsVisible;

						childSet.width(itemsWidth);
						object.css({
							'left': -itemsWidth
						});

						// var halfArrowHeight = (leftArrow.height())/2;
						// var arrowMargin = (innerHeight/2) - halfArrowHeight;
						// leftArrow.css("top", arrowMargin + "px");
						// rightArrow.css("top", arrowMargin + "px");

					});

					$(leftArrow).on("click", function(event) {
						methods.scrollLeft();
					});

					$(rightArrow).on("click", function(event) {
						methods.scrollRight();
					});

					if (settings.pauseOnHover == true) {
						$(".nbs-flexisel-item").on({
							mouseenter: function() {
								canNavigate = false;
							},
							mouseleave: function() {
								canNavigate = true;
							}
						});
					}

					if (settings.autoPlay == true) {

						setInterval(function() {
							if (canNavigate == true)
								methods.scrollRight();
						}, settings.autoPlaySpeed);
					}

				},

				/******************************
			Set Responsive Events
			*******************************/

				setResponsiveEvents: function() {
					var contentWidth = $('html').width();

					if (settings.enableResponsiveBreakpoints == true) {
						if (contentWidth < settings.responsiveBreakpoints.portrait.changePoint) {
							itemsVisible = settings.responsiveBreakpoints.portrait.visibleItems;
						} else if (contentWidth > settings.responsiveBreakpoints.portrait.changePoint && contentWidth < settings.responsiveBreakpoints.landscape.changePoint) {
							itemsVisible = settings.responsiveBreakpoints.landscape.visibleItems;
						} else if (contentWidth > settings.responsiveBreakpoints.landscape.changePoint && contentWidth < settings.responsiveBreakpoints.tablet.changePoint) {
							itemsVisible = settings.responsiveBreakpoints.tablet.visibleItems;
						} else {
							itemsVisible = settings.visibleItems;
						}
					}
				},

				/******************************
			Scroll Left
			*******************************/

				scrollLeft: function() {

					if (canNavigate == true) {
						canNavigate = false;

						var listParent = object.parent();
						var innerWidth = listParent.width();

						itemsWidth = (innerWidth) / itemsVisible;

						var childSet = object.children();

						object.animate({
							'left': "+=" + itemsWidth
						}, {
							queue: false,
							duration: settings.animationSpeed,
							easing: "linear",
							complete: function() {
								childSet.last().insertBefore(childSet.first()); // Get the first list item and put it after the last list item (that's how the infinite effects is made)   								
								methods.adjustScroll();
								canNavigate = true;
							}
						});
					}
				},

				/******************************
			Scroll Right
			*******************************/

				scrollRight: function() {

					if (canNavigate == true) {
						canNavigate = false;

						var listParent = object.parent();
						var innerWidth = listParent.width();

						itemsWidth = (innerWidth) / itemsVisible;

						var childSet = object.children();

						object.animate({
							'left': "-=" + itemsWidth
						}, {
							queue: false,
							duration: settings.animationSpeed,
							easing: "linear",
							complete: function() {
								childSet.first().insertAfter(childSet.last()); // Get the first list item and put it after the last list item (that's how the infinite effects is made)   
								methods.adjustScroll();
								canNavigate = true;
							}
						});
					}
				},

				/******************************
			Adjust Scroll 
			*******************************/

				adjustScroll: function() {

					var listParent = object.parent();
					var childSet = object.children();

					var innerWidth = listParent.width();
					itemsWidth = (innerWidth) / itemsVisible;
					childSet.width(itemsWidth);
					object.css({
						'left': -itemsWidth
					});
				}

			};

			if (methods[options]) { // $("#element").pluginName('methodName', 'arg1', 'arg2');
				return methods[options].apply(this, Array.prototype.slice.call(arguments, 1));
			} else if (typeof options === 'object' || !options) { // $("#element").pluginName({ option: 1, option:2 });
				return methods.init.apply(this);
			} else {
				$.error('Method "' + method + '" does not exist in flexisel plugin!');
			}
		};

	})(jQuery);


});
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

/* @source module/slider.js */;

/**
 * 全站Tab切换、滚动Banner
 */
define("module/slider", [
  "tui/event"
], function(Event) {


	function getTabIndex(obj) {
		if (obj && obj.tagName) {
			var me = (obj.tagName.toLowerCase() == 'a') ? $(obj) : $(obj).find('a');
			me = me.length ? me : $(obj);
			return (me.attr('rel') || me.attr('href').replace(/.*#(\d+)$/, '$1') || 1) - 1;
		} else {
			return 0;
		}
	}

	function clearTimer(timer) {
		var args = arguments;
		for (var i = 0, l = args.length; i < l; i++) {
			var timer = args[i];
			if (timer) clearTimeout(timer);
		}
		return null;
	}

	function lazyLoad(){

	}


	var Klass = Event.extend({
		initialize: function(op) {
			var self = this;
			Klass.superClass.initialize.apply(self, arguments);

			self.op = op || {};
			self.op.slide = op.slide || false;
			self.op.linktab = op.linktab || false;
			self.op.clicktab = op.clicktab || false;

			// 界面对象
			var box = self.box = $(op.box);
			var tab = self.tab = $(op.tab || '.tab li', box);
			var panel = self.panel = $(op.panel || '.c', box);

			self.size = tab.length || panel.length;
			self.loop = op.loop || 0;
			self.current = getTabIndex(tab.filter('.current')[0]);

			if (self.size < 2) return;

			// 可点击Tab
			if (self.op.clicktab) {
				tab.click(function(event) {
					event.preventDefault();
					self.go(getTabIndex(this));
				});
			} else {
				// 非带链接Tab
				if (!self.op.linktab) {
					tab.click(function(event) {
						event.preventDefault()
					});
				}
				tab.mouseenter(function() {
					clearTimer(self.timer, self.looptimer);
					var me = this;
					self.timer = setTimeout(function() {
						self.go(getTabIndex(me));
					}, 30);
				}).mouseleave(function() {
					clearTimer(self.timer, self.looptimer);
					self.start();
				});
			}

			// 循环切换
			if (self.loop) {
				self.check(self.op.clicktab ? tab : null);
				self.start();
			}


			tab.parent().on('click', 'a', function(event) {
				var href = $(this).attr('href');

				if (!href || href == '#' || href.length < 5) {
					event.preventDefault();
				}
			});
		},

		go: function(cur, auto) {
			var self = this;
			cur = auto ? cur : Math.min(Math.max(cur, 0), self.size - 1);
			self.trigger('before', [self.current, cur, self]);

			var prev = self.current;

			self.current = cur % self.size;
			self.tab.removeClass('current').eq(self.current).addClass('current');

			var isFade = self.op.fade;
			var panels = self.panel;
			var duration = self.op.duration ? self.op.duration : '25';

			panels.eq(prev)[isFade ? 'fadeOut' : 'hide'](duration);
			panels.eq(self.current)[isFade ? 'fadeIn' : 'show'](duration);

			self.trigger('after', [self.current, self]);
		},
		prev: function(auto) {
			this.go(this.current - 1, auto);
		},
		next: function(auto) {
			this.go(this.current + 1, auto);
		},
		start: function(start) {
			var self = this;
			if (self.loop) {
				clearTimer(self.looptimer);
				if (start) self.start();
				self.looptimer = setTimeout(function() {
					self.start();
					self.next(true);
				}, self.loop);
			}
		},
		stop: function() {
			clearTimer(this.looptimer);
		},
		check: function(obj) {
			var self = this;
			(obj || self.panel).mouseenter(function() {
				clearTimer(self.looptimer);
			}).mouseleave(function() {
				clearTimer(self.looptimer);
				self.start();
			});
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

/* @source app/nav.js */;

define("app/nav", [
  "tui/art"
], function(Art, require, exports) {
	

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
			force: false, //强制fixed 默认根据body高度来定
			top: 90, //距离顶部fixed 
			disabled: true //禁用fixed（默认关闭伴随）
		}, op);

		var $win = $(window);
		var winH = $win.height();
		var $nav = $('#header .m-nav');
		var barStatus = 0;
		var top = op.top;


		//较少内容
		if(op.disabled || !op.force){
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

		fixnav(op);
		g_dropdown_toggle();

	};


});
/* @source  */;

require(['app/nav', 'module/slider', 'module/flexisel'], function(Nav, Slider, Flexisel) {
	Nav.init({disabled: false});


	var $focus = $('#jsFocus');
	var slider = new Slider({
		box: $focus,
		tab: '.btns a',
		panel: 'li',
		fade: true,
		duration: 500,
		loop: 5000
	});

	$focus.on('click', '.prev', function(e) {
		e.preventDefault();
		prev();

	}).on('click', '.next', function(e) {
		e.preventDefault();
		next();
	}).on('mouseenter', function() {
		$(this).find('.prev').css({
			left: '20px'
		});
		$(this).find('.next').css({
			right: '20px'
		});
		slider.stop();
	}).on('mouseleave', function() {
		$(this).find('.prev').css({
			left: '-999px'
		});
		$(this).find('.next').css({
			right: '-999px'
		});
		slider.start();
	});


	function next() {
		var prev = slider.current;
		if (prev > slider.size) {
			slider.go(0);
		} else {
			slider.next(true);
		}
	}

	function prev() {
		var prev = slider.current;

		if (prev < 1) {
			slider.go(slider.size - 1);
		} else {
			slider.prev(true);
		}
	}

	// $('#magazineSlide').flexisel({
	// 	visibleItems: 4,
	// 	animationSpeed: 200,
	// 	autoPlay: false,
	// 	pauseOnHover: true,
	// 	enableResponsiveBreakpoints: false

	// });

	$('#memberSlide').flexisel({
		visibleItems: 5,
		animationSpeed: 1000,
		autoPlay: true,
		// autoPlaySpeed: 50,
		pauseOnHover: true,
		enableResponsiveBreakpoints: false
	});



});

})(window.jQuery);

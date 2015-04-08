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

		fixnav(op);
		g_dropdown_toggle();

	};


});
/* @source  */;

require(['app/nav', 'app/share', 'module/switchtab'], function(Nav, Share, Switchtab) {
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
	newTab.bind('before', function(prev, cur) {
		loadImg(cur);
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



});

})(window.jQuery);

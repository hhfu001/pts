/**
 * @modified $Author$
 * @version $Rev$
 */

(function($) {


require.config({ enable_ozma: true });


/* @source tui/util/num.js */;


define('tui/util/num',[], function(require, exports) {

	/**
	 * 对目标数字进行0补齐处理
	 * @param {number} source 需要处理的数字
	 * @param {number} length 需要输出的长度
	 *
	 * @returns {string} 对目标数字进行0补齐处理后的结果
	 * @reference http://tangram.baidu.com/api.html#baidu.number.pad
	 */
	function pad(source, length) {
		var pre = '',
			negative = (source < 0),
			string = String(Math.abs(source));

		if (string.length < length) {
			pre = (new Array(length - string.length + 1)).join('0');
		}

		return (negative ?  '-' : '') + pre + string;
	}

	// format(2, '00000') -> '00002'
	function formatNumber(data, format) {
		format = format.length;
		data = data || 0;
		return format == 1 ? data : (data = String(Math.pow(10, format) + data)).substr(data.length - format);
	}

	// 1234 -> 1,234
	function numberSplit(num, separator){
		separator = separator || ',';
		return String(num).replace(/(\d)(?=(\d{3})+($|\.))/g, '$1'+separator);
	}

	function field(num){
		num = parseInt(num);
		var numStr;
		if(num >= 10E7){ // 1亿 1.2亿 12.4亿
			numStr = (num / 10E7).toFixed(2) + '亿'
		}else if(num >= 10E3){ // 1.20万 1.23万 12.34万 100万 100.03万 1,234万
			var n = num / 10E3;
			var nl = parseInt(n).toString();
			var nlLen = nl.length;
			if(nlLen < 4 && n != nl){ // 保证只显示4个数字
				nl = n.toFixed(nlLen == 1 ? 2 : 4 - nlLen);
			}
			numStr = numberSplit(nl) + '万';
		}else{ // 123 12,234
			numStr = numberSplit(num);
		}
		return numStr;
	}

	// 数字字节格式化
	function bytes(bytes){
		bytes = parseInt(bytes);
		var i = -1;
		do {
			bytes /= 1024;
			i++;
		} while (bytes > 1024);
		return Math.max(bytes, 0.1).toFixed(1) + ['KB', 'MB', 'GB', 'TB'][i];
	}

	exports.pad = pad;
	exports.format = formatNumber;
	exports.split = numberSplit;
	exports.field = field;
	exports.bytes = bytes;
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

			// isFade ? panels.eq(prev).css({'z-index': 0}).stop().fadeOut(100) : panels.hide();
			panels.eq(prev).css({'z-index': 0});

			panels.eq(self.current).css({'z-index': 2})[isFade ? 'fadeIn' : 'show'](self.op.duration ? self.op.duration : '100', function(){
				panels.eq(prev).hide();
			});
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
/* @source jquery.js */;


/* autogeneration */
define("jquery", [], function(){});

/* @source module/odometer.js */;

(function() {

  
  var COUNT_FRAMERATE, COUNT_MS_PER_FRAME, DIGIT_FORMAT, DIGIT_HTML, DIGIT_SPEEDBOOST, DURATION, FORMAT_MARK_HTML, FORMAT_PARSER, FRAMERATE, FRAMES_PER_VALUE, MS_PER_FRAME, MutationObserver, Odometer, RIBBON_HTML, TRANSITION_END_EVENTS, TRANSITION_SUPPORT, VALUE_HTML, addClass, createFromHTML, fractionalPart, now, removeClass, requestAnimationFrame, round, transitionCheckStyles, trigger, truncate, wrapJQuery, _jQueryWrapped, _old, _ref, _ref1,
    __slice = [].slice;

  VALUE_HTML = '<span class="odometer-value"></span>';

  RIBBON_HTML = '<span class="odometer-ribbon"><span class="odometer-ribbon-inner">' + VALUE_HTML + '</span></span>';

  DIGIT_HTML = '<span class="odometer-digit"><span class="odometer-digit-spacer">8</span><span class="odometer-digit-inner">' + RIBBON_HTML + '</span></span>';

  FORMAT_MARK_HTML = '<span class="odometer-formatting-mark"></span>';

  DIGIT_FORMAT = '(,ddd).dd';

  FORMAT_PARSER = /^\(?([^)]*)\)?(?:(.)(d+))?$/;

  FRAMERATE = 30;

  DURATION = 2000;

  COUNT_FRAMERATE = 20;

  FRAMES_PER_VALUE = 2;

  DIGIT_SPEEDBOOST = .5;

  MS_PER_FRAME = 1000 / FRAMERATE;

  COUNT_MS_PER_FRAME = 1000 / COUNT_FRAMERATE;

  TRANSITION_END_EVENTS = 'transitionend webkitTransitionEnd oTransitionEnd otransitionend MSTransitionEnd';

  transitionCheckStyles = document.createElement('div').style;

  TRANSITION_SUPPORT = (transitionCheckStyles.transition != null) || (transitionCheckStyles.webkitTransition != null) || (transitionCheckStyles.mozTransition != null) || (transitionCheckStyles.oTransition != null);

  requestAnimationFrame = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame;

  MutationObserver = window.MutationObserver || window.WebKitMutationObserver || window.MozMutationObserver;

  createFromHTML = function(html) {
    var el;
    el = document.createElement('div');
    el.innerHTML = html;
    return el.children[0];
  };

  removeClass = function(el, name) {
    return el.className = el.className.replace(new RegExp("(^| )" + (name.split(' ').join('|')) + "( |$)", 'gi'), ' ');
  };

  addClass = function(el, name) {
    removeClass(el, name);
    return el.className += " " + name;
  };

  trigger = function(el, name) {
    var evt;
    if (document.createEvent != null) {
      evt = document.createEvent('HTMLEvents');
      evt.initEvent(name, true, true);
      return el.dispatchEvent(evt);
    }
  };

  now = function() {
    var _ref, _ref1;
    return (_ref = (_ref1 = window.performance) != null ? typeof _ref1.now === "function" ? _ref1.now() : void 0 : void 0) != null ? _ref : +(new Date);
  };

  round = function(val, precision) {
    if (precision == null) {
      precision = 0;
    }
    if (!precision) {
      return Math.round(val);
    }
    val *= Math.pow(10, precision);
    val += 0.5;
    val = Math.floor(val);
    return val /= Math.pow(10, precision);
  };

  truncate = function(val) {
    if (val < 0) {
      return Math.ceil(val);
    } else {
      return Math.floor(val);
    }
  };

  fractionalPart = function(val) {
    return val - round(val);
  };

  _jQueryWrapped = false;

  (wrapJQuery = function() {
    var property, _i, _len, _ref, _results;
    if (_jQueryWrapped) {
      return;
    }
    if (window.jQuery != null) {
      _jQueryWrapped = true;
      _ref = ['html', 'text'];
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        property = _ref[_i];
        _results.push((function(property) {
          var old;
          old = window.jQuery.fn[property];
          return window.jQuery.fn[property] = function(val) {
            var _ref1;
            if ((val == null) || (((_ref1 = this[0]) != null ? _ref1.odometer : void 0) == null)) {
              return old.apply(this, arguments);
            }
            return this[0].odometer.update(val);
          };
        })(property));
      }
      return _results;
    }
  })();

  setTimeout(wrapJQuery, 0);

  Odometer = (function() {
    function Odometer(options) {
      var e, k, property, v, _base, _i, _len, _ref, _ref1, _ref2,
        _this = this;
      this.options = options;
      this.el = this.options.el;
      if (this.el.odometer != null) {
        return this.el.odometer;
      }
      this.el.odometer = this;
      _ref = Odometer.options;
      for (k in _ref) {
        v = _ref[k];
        if (this.options[k] == null) {
          this.options[k] = v;
        }
      }
      if ((_base = this.options).duration == null) {
        _base.duration = DURATION;
      }
      this.MAX_VALUES = ((this.options.duration / MS_PER_FRAME) / FRAMES_PER_VALUE) | 0;
      this.resetFormat();
      this.value = this.cleanValue((_ref1 = this.options.value) != null ? _ref1 : '');
      this.renderInside();
      this.render();
      try {
        _ref2 = ['innerHTML', 'innerText', 'textContent'];
        for (_i = 0, _len = _ref2.length; _i < _len; _i++) {
          property = _ref2[_i];
          if (this.el[property] != null) {
            (function(property) {
              return Object.defineProperty(_this.el, property, {
                get: function() {
                  var _ref3;
                  if (property === 'innerHTML') {
                    return _this.inside.outerHTML;
                  } else {
                    return (_ref3 = _this.inside.innerText) != null ? _ref3 : _this.inside.textContent;
                  }
                },
                set: function(val) {
                  return _this.update(val);
                }
              });
            })(property);
          }
        }
      } catch (_error) {
        e = _error;
        this.watchForMutations();
      }
      this;
    }

    Odometer.prototype.renderInside = function() {
      this.inside = document.createElement('div');
      this.inside.className = 'odometer-inside';
      this.el.innerHTML = '';
      return this.el.appendChild(this.inside);
    };

    Odometer.prototype.watchForMutations = function() {
      var e,
        _this = this;
      if (MutationObserver == null) {
        return;
      }
      try {
        if (this.observer == null) {
          this.observer = new MutationObserver(function(mutations) {
            var newVal;
            newVal = _this.el.innerText;
            _this.renderInside();
            _this.render(_this.value);
            return _this.update(newVal);
          });
        }
        this.watchMutations = true;
        return this.startWatchingMutations();
      } catch (_error) {
        e = _error;
      }
    };

    Odometer.prototype.startWatchingMutations = function() {
      if (this.watchMutations) {
        return this.observer.observe(this.el, {
          childList: true
        });
      }
    };

    Odometer.prototype.stopWatchingMutations = function() {
      var _ref;
      return (_ref = this.observer) != null ? _ref.disconnect() : void 0;
    };

    Odometer.prototype.cleanValue = function(val) {
      var _ref;
      if (typeof val === 'string') {
        val = val.replace((_ref = this.format.radix) != null ? _ref : '.', '<radix>');
        val = val.replace(/[.,]/g, '');
        val = val.replace('<radix>', '.');
        val = parseFloat(val, 10) || 0;
      }
      return round(val, this.format.precision);
    };

    Odometer.prototype.bindTransitionEnd = function() {
      var event, renderEnqueued, _i, _len, _ref, _results,
        _this = this;
      if (this.transitionEndBound) {
        return;
      }
      this.transitionEndBound = true;
      renderEnqueued = false;
      _ref = TRANSITION_END_EVENTS.split(' ');
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        event = _ref[_i];
        _results.push(this.el.addEventListener(event, function() {
          if (renderEnqueued) {
            return true;
          }
          renderEnqueued = true;
          setTimeout(function() {
            _this.render();
            renderEnqueued = false;
            return trigger(_this.el, 'odometerdone');
          }, 0);
          return true;
        }, false));
      }
      return _results;
    };

    Odometer.prototype.resetFormat = function() {
      var format, fractional, parsed, precision, radix, repeating, _ref, _ref1;
      format = (_ref = this.options.format) != null ? _ref : DIGIT_FORMAT;
      format || (format = 'd');
      parsed = FORMAT_PARSER.exec(format);
      if (!parsed) {
        throw new Error("Odometer: Unparsable digit format");
      }
      _ref1 = parsed.slice(1, 4), repeating = _ref1[0], radix = _ref1[1], fractional = _ref1[2];
      precision = (fractional != null ? fractional.length : void 0) || 0;
      return this.format = {
        repeating: repeating,
        radix: radix,
        precision: precision
      };
    };

    Odometer.prototype.render = function(value) {
      var classes, cls, digit, match, newClasses, theme, wholePart, _i, _j, _len, _len1, _ref;
      if (value == null) {
        value = this.value;
      }
      this.stopWatchingMutations();
      this.resetFormat();
      this.inside.innerHTML = '';
      theme = this.options.theme;
      classes = this.el.className.split(' ');
      newClasses = [];
      for (_i = 0, _len = classes.length; _i < _len; _i++) {
        cls = classes[_i];
        if (!cls.length) {
          continue;
        }
        if (match = /^odometer-theme-(.+)$/.exec(cls)) {
          theme = match[1];
          continue;
        }
        if (/^odometer(-|$)/.test(cls)) {
          continue;
        }
        newClasses.push(cls);
      }
      newClasses.push('odometer');
      if (!TRANSITION_SUPPORT) {
        newClasses.push('odometer-no-transitions');
      }
      if (theme) {
        newClasses.push("odometer-theme-" + theme);
      } else {
        newClasses.push("odometer-auto-theme");
      }
      this.el.className = newClasses.join(' ');
      this.ribbons = {};
      this.digits = [];
      wholePart = !this.format.precision || !fractionalPart(value) || false;
      _ref = value.toString().split('').reverse();
      for (_j = 0, _len1 = _ref.length; _j < _len1; _j++) {
        digit = _ref[_j];
        if (digit === '.') {
          wholePart = true;
        }
        this.addDigit(digit, wholePart);
      }
      return this.startWatchingMutations();
    };

    Odometer.prototype.update = function(newValue) {
      var diff,
        _this = this;
      newValue = this.cleanValue(newValue);
      if (!(diff = newValue - this.value)) {
        return;
      }
      removeClass(this.el, 'odometer-animating-up odometer-animating-down odometer-animating');
      if (diff > 0) {
        addClass(this.el, 'odometer-animating-up');
      } else {
        addClass(this.el, 'odometer-animating-down');
      }
      this.stopWatchingMutations();
      this.animate(newValue);
      this.startWatchingMutations();
      setTimeout(function() {
        _this.el.offsetHeight;
        return addClass(_this.el, 'odometer-animating');
      }, 0);
      return this.value = newValue;
    };

    Odometer.prototype.renderDigit = function() {
      return createFromHTML(DIGIT_HTML);
    };

    Odometer.prototype.insertDigit = function(digit, before) {
      if (before != null) {
        return this.inside.insertBefore(digit, before);
      } else if (!this.inside.children.length) {
        return this.inside.appendChild(digit);
      } else {
        return this.inside.insertBefore(digit, this.inside.children[0]);
      }
    };

    Odometer.prototype.addSpacer = function(chr, before, extraClasses) {
      var spacer;
      spacer = createFromHTML(FORMAT_MARK_HTML);
      spacer.innerHTML = chr;
      if (extraClasses) {
        addClass(spacer, extraClasses);
      }
      return this.insertDigit(spacer, before);
    };

    Odometer.prototype.addDigit = function(value, repeating) {
      var chr, digit, resetted, _ref;
      if (repeating == null) {
        repeating = true;
      }
      if (value === '-') {
        return this.addSpacer(value, null, 'odometer-negation-mark');
      }
      if (value === '.') {
        return this.addSpacer((_ref = this.format.radix) != null ? _ref : '.', null, 'odometer-radix-mark');
      }
      if (repeating) {
        resetted = false;
        while (true) {
          if (!this.format.repeating.length) {
            if (resetted) {
              throw new Error("Bad odometer format without digits");
            }
            this.resetFormat();
            resetted = true;
          }
          chr = this.format.repeating[this.format.repeating.length - 1];
          this.format.repeating = this.format.repeating.substring(0, this.format.repeating.length - 1);
          if (chr === 'd') {
            break;
          }
          this.addSpacer(chr);
        }
      }
      digit = this.renderDigit();
      digit.querySelector('.odometer-value').innerHTML = value;
      this.digits.push(digit);
      return this.insertDigit(digit);
    };

    Odometer.prototype.animate = function(newValue) {
      if (!TRANSITION_SUPPORT || this.options.animation === 'count') {
        return this.animateCount(newValue);
      } else {
        return this.animateSlide(newValue);
      }
    };

    Odometer.prototype.animateCount = function(newValue) {
      var cur, diff, last, start, tick,
        _this = this;
      if (!(diff = +newValue - this.value)) {
        return;
      }
      start = last = now();
      cur = this.value;
      return (tick = function() {
        var delta, dist, fraction;
        if ((now() - start) > _this.options.duration) {
          _this.value = newValue;
          _this.render();
          trigger(_this.el, 'odometerdone');
          return;
        }
        delta = now() - last;
        if (delta > COUNT_MS_PER_FRAME) {
          last = now();
          fraction = delta / _this.options.duration;
          dist = diff * fraction;
          cur += dist;
          _this.render(Math.round(cur));
        }
        if (requestAnimationFrame != null) {
          return requestAnimationFrame(tick);
        } else {
          return setTimeout(tick, COUNT_MS_PER_FRAME);
        }
      })();
    };

    Odometer.prototype.getDigitCount = function() {
      var i, max, value, values, _i, _len;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
        value = values[i];
        values[i] = Math.abs(value);
      }
      max = Math.max.apply(Math, values);
      return Math.ceil(Math.log(max + 1) / Math.log(10));
    };

    Odometer.prototype.getFractionalDigitCount = function() {
      var i, parser, parts, value, values, _i, _len;
      values = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
      parser = /^\-?\d*\.(\d*?)0*$/;
      for (i = _i = 0, _len = values.length; _i < _len; i = ++_i) {
        value = values[i];
        values[i] = value.toString();
        parts = parser.exec(values[i]);
        if (parts == null) {
          values[i] = 0;
        } else {
          values[i] = parts[1].length;
        }
      }
      return Math.max.apply(Math, values);
    };

    Odometer.prototype.resetDigits = function() {
      this.digits = [];
      this.ribbons = [];
      this.inside.innerHTML = '';
      return this.resetFormat();
    };

    Odometer.prototype.animateSlide = function(newValue) {
      var boosted, cur, diff, digitCount, digits, dist, end, fractionalCount, frame, frames, i, incr, j, mark, numEl, oldValue, start, _base, _i, _j, _k, _l, _len, _len1, _len2, _m, _ref, _results;
      oldValue = this.value;
      fractionalCount = this.getFractionalDigitCount(oldValue, newValue);
      if (fractionalCount) {
        newValue = newValue * Math.pow(10, fractionalCount);
        oldValue = oldValue * Math.pow(10, fractionalCount);
      }
      if (!(diff = newValue - oldValue)) {
        return;
      }
      this.bindTransitionEnd();
      digitCount = this.getDigitCount(oldValue, newValue);
      digits = [];
      boosted = 0;
      for (i = _i = 0; 0 <= digitCount ? _i < digitCount : _i > digitCount; i = 0 <= digitCount ? ++_i : --_i) {
        start = truncate(oldValue / Math.pow(10, digitCount - i - 1));
        end = truncate(newValue / Math.pow(10, digitCount - i - 1));
        dist = end - start;
        if (Math.abs(dist) > this.MAX_VALUES) {
          frames = [];
          incr = dist / (this.MAX_VALUES + this.MAX_VALUES * boosted * DIGIT_SPEEDBOOST);
          cur = start;
          while ((dist > 0 && cur < end) || (dist < 0 && cur > end)) {
            frames.push(Math.round(cur));
            cur += incr;
          }
          if (frames[frames.length - 1] !== end) {
            frames.push(end);
          }
          boosted++;
        } else {
          frames = (function() {
            _results = [];
            for (var _j = start; start <= end ? _j <= end : _j >= end; start <= end ? _j++ : _j--){ _results.push(_j); }
            return _results;
          }).apply(this);
        }
        for (i = _k = 0, _len = frames.length; _k < _len; i = ++_k) {
          frame = frames[i];
          frames[i] = Math.abs(frame % 10);
        }
        digits.push(frames);
      }
      this.resetDigits();
      _ref = digits.reverse();
      for (i = _l = 0, _len1 = _ref.length; _l < _len1; i = ++_l) {
        frames = _ref[i];
        if (!this.digits[i]) {
          this.addDigit(' ', i >= fractionalCount);
        }
        if ((_base = this.ribbons)[i] == null) {
          _base[i] = this.digits[i].querySelector('.odometer-ribbon-inner');
        }
        this.ribbons[i].innerHTML = '';
        if (diff < 0) {
          frames = frames.reverse();
        }
        for (j = _m = 0, _len2 = frames.length; _m < _len2; j = ++_m) {
          frame = frames[j];
          numEl = document.createElement('div');
          numEl.className = 'odometer-value';
          numEl.innerHTML = frame;
          this.ribbons[i].appendChild(numEl);
          if (j === frames.length - 1) {
            addClass(numEl, 'odometer-last-value');
          }
          if (j === 0) {
            addClass(numEl, 'odometer-first-value');
          }
        }
      }
      if (start < 0) {
        this.addDigit('-');
      }
      mark = this.inside.querySelector('.odometer-radix-mark');
      if (mark != null) {
        mark.parent.removeChild(mark);
      }
      if (fractionalCount) {
        return this.addSpacer(this.format.radix, this.digits[fractionalCount - 1], 'odometer-radix-mark');
      }
    };

    return Odometer;

  })();

  Odometer.options = (_ref = window.odometerOptions) != null ? _ref : {};

  setTimeout(function() {
    var k, v, _base, _ref1, _results;
    if (window.odometerOptions) {
      _ref1 = window.odometerOptions;
      _results = [];
      for (k in _ref1) {
        v = _ref1[k];
        _results.push((_base = Odometer.options)[k] != null ? (_base = Odometer.options)[k] : _base[k] = v);
      }
      return _results;
    }
  }, 0);

  Odometer.init = function() {
    var el, elements, _i, _len, _ref1, _results;
    if (document.querySelectorAll == null) {
      return;
    }
    elements = document.querySelectorAll(Odometer.options.selector || '.odometer');
    _results = [];
    for (_i = 0, _len = elements.length; _i < _len; _i++) {
      el = elements[_i];
      _results.push(el.odometer = new Odometer({
        el: el,
        value: (_ref1 = el.innerText) != null ? _ref1 : el.textContent
      }));
    }
    return _results;
  };

  if ((((_ref1 = document.documentElement) != null ? _ref1.doScroll : void 0) != null) && (document.createEventObject != null)) {
    _old = document.onreadystatechange;
    document.onreadystatechange = function() {
      if (document.readyState === 'complete' && Odometer.options.auto !== false) {
        Odometer.init();
      }
      return _old != null ? _old.apply(this, arguments) : void 0;
    };
  } else {
    document.addEventListener('DOMContentLoaded', function() {
      if (Odometer.options.auto !== false) {
        return Odometer.init();
      }
    }, false);
  }

  if (typeof define === 'function' && define.amd) {
    define("module/odometer", [
  "jquery"
], function() {
      return Odometer;
    });
  } else if (typeof exports === !'undefined') {
    module.exports = Odometer;
  } else {
    window.Odometer = Odometer;
  }

}).call(this);
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

/* @source tui/nprogress.js */;

/* NProgress, (c) 2013, 2014 Rico Sta. Cruz - http://ricostacruz.com/nprogress
 * @license MIT 
 * https://github.com/rstacruz/nprogress
 */

define('tui/nprogress', [], function(require, exports) {

  var NProgress = {};
  var $body = $(document.body)


  NProgress.version = '0.1.6';

  var Settings = NProgress.settings = {
    minimum: 0.08,
    easing: 'ease',
    positionUsing: '',
    speed: 200,
    trickle: true,
    trickleRate: 0.02,
    trickleSpeed: 800,
    showSpinner: true,
    barSelector: '[role="bar"]',
    spinnerSelector: '[role="spinner"]',
    parent: 'body',
    template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>'
  };

  /**
   * Updates configuration.
   *
   *     NProgress.configure({
   *       minimum: 0.1
   *     });
   */

  NProgress.configure = function(options) {

    return $.extend(Settings, options || {});
  };

  /**
   * Last number.
   */

  NProgress.status = null;

  /**
   * Sets the progress bar status, where `n` is a number from `0.0` to `1.0`.
   *
   *     NProgress.set(0.4);
   *     NProgress.set(1.0);
   */

  NProgress.set = function(n) {
    var started = NProgress.isStarted();

    n = clamp(n, Settings.minimum, 1);
    NProgress.status = (n === 1 ? null : n);

    var progress = NProgress.render(!started),
        bar      = progress.find(Settings.barSelector),
        speed    = Settings.speed,
        ease     = Settings.easing;

    progress[0].offsetWidth; /* Repaint */

    queue(function(next) {

      // Add transition
      bar.css(barPositionCSS(n, speed, ease));

      if (n === 1) {
        // Fade out

        progress.css({ 
          transition: 'none', 
          opacity: 1 
        })

        progress[0].offsetWidth; /* Repaint */

        setTimeout(function() {
          progress.css({ 
            transition: 'all ' + speed + 'ms linear', 
            opacity: 0 
          });
          setTimeout(function() {
            NProgress.remove();
            next();
          }, speed);
        }, speed);
      } else {
        setTimeout(next, speed);
      }
    });

    return this;
  };

  NProgress.isStarted = function() {
    return typeof NProgress.status === 'number';
  };

  /**
   * Shows the progress bar.
   * This is the same as setting the status to 0%, except that it doesn't go backwards.
   *
   *     NProgress.start();
   *
   */
  NProgress.start = function() {

    if (!NProgress.status) NProgress.set(0);

    var work = function() {
      setTimeout(function() {
        if (!NProgress.status) return;
        NProgress.trickle();
        work();
      }, Settings.trickleSpeed);
    };

    if (Settings.trickle) work();

    return this;
  };

  /**
   * Hides the progress bar.
   * This is the *sort of* the same as setting the status to 100%, with the
   * difference being `done()` makes some placebo effect of some realistic motion.
   *
   *     NProgress.done();
   *
   * If `true` is passed, it will show the progress bar even if its hidden.
   *
   *     NProgress.done(true);
   */

  NProgress.done = function(force) {
    if (!force && !NProgress.status) return this;

    return NProgress.inc(0.3 + 0.5 * Math.random()).set(1);
  };

  /**
   * Increments by a random amount.
   */

  NProgress.inc = function(amount) {
    var n = NProgress.status;

    if (!n) {
      return NProgress.start();
    } else {
      if (typeof amount !== 'number') {
        amount = (1 - n) * clamp(Math.random() * n, 0.1, 0.95);
      }

      n = clamp(n + amount, 0, 0.994);
      return NProgress.set(n);
    }
  };

  NProgress.trickle = function() {
    return NProgress.inc(Math.random() * Settings.trickleRate);
  };

  /**
   * Waits for all supplied jQuery promises and
   * increases the progress as the promises resolve.
   * 
   * @param $promise jQUery Promise
   */
  (function() {
    var initial = 0, current = 0;
    
    NProgress.promise = function($promise) {
      if (!$promise || $promise.state() == "resolved") {
        return this;
      }
      
      if (current == 0) {
        NProgress.start();
      }
      
      initial++;
      current++;
      
      $promise.always(function() {
        current--;
        if (current == 0) {
            initial = 0;
            NProgress.done();
        } else {
            NProgress.set((initial - current) / initial);
        }
      });
      
      return this;
    };
    
  })();

  /**
   * (Internal) renders the progress bar markup based on the `template`
   * setting.
   */

  NProgress.render = function(fromStart) {
    // Set positionUsing if it hasn't already been set
    if (Settings.positionUsing === '') Settings.positionUsing = NProgress.getPositioningCSS();

    if(Settings.positionUsing === 'margin'){
      Settings.showSpinner = false;
    }
        
    if (NProgress.isRendered()) return $('#nprogress');

    $body.addClass('nprogress-busy');
    //addClass(document.documentElement, 'nprogress-busy');
    
    // var progress = document.createElement('div');
    // progress.id = 'nprogress';
    // progress.innerHTML = Settings.template;

    var progress = $('<div id="nprogress">'+ Settings.template +'</div>');


    var bar      = progress.find(Settings.barSelector),
        perc     = fromStart ? '-100' : toBarPerc(NProgress.status || 0),
        parent   = $(Settings.parent),
        spinner;

    bar.css({
      transition: 'all 0 linear',
      transform: 'translate3d(' + perc + '%,0,0)'
    });

    if (!Settings.showSpinner) {
      spinner = progress.find(Settings.spinnerSelector);
      spinner.length && spinner.remove();
    }

    if (parent[0] != document.body) {
      parent.addClass('nprogress-custom-parent');
    }

    parent.append(progress);
    return progress;
  };

  /**
   * Removes the element. Opposite of render().
   */

  NProgress.remove = function() {
    $body.removeClass('nprogress-busy');
    $(Settings.parent).removeClass('nprogress-custom-parent');

    var progress = $('#nprogress');
    progress.length && progress.remove();
  };

  /**
   * Checks if the progress bar is rendered.
   */

  NProgress.isRendered = function() {
    return $('#nprogress').length;
  };

  /**
   * Determine which positioning CSS rule to use.
   */

  NProgress.getPositioningCSS = function() {
    // Sniff on document.body.style
    var bodyStyle = document.body.style;

    // Sniff prefixes
    var vendorPrefix = ('WebkitTransform' in bodyStyle) ? 'Webkit' :
                       ('MozTransform' in bodyStyle) ? 'Moz' :
                       ('msTransform' in bodyStyle) ? 'ms' :
                       ('OTransform' in bodyStyle) ? 'O' : '';

    if (vendorPrefix + 'Perspective' in bodyStyle) {
      // Modern browsers with 3D support, e.g. Webkit, IE10
      return 'translate3d';
    } else if (vendorPrefix + 'Transform' in bodyStyle) {
      // Browsers without 3D support, e.g. IE9
      return 'translate';
    } else {
      // Browsers without translate() support, e.g. IE7-8
      return 'margin';
    }
  };

  /**
   * Helpers
   */

  function clamp(n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
  }

  /**
   * (Internal) converts a percentage (`0..1`) to a bar translateX
   * percentage (`-100%..0%`).
   */

  function toBarPerc(n) {
    return (-1 + n) * 100;
  }


  /**
   * (Internal) returns the correct CSS for changing the bar's
   * position given an n percentage, and speed and ease from Settings
   */

  function barPositionCSS(n, speed, ease) {
    var barCSS;

    if (Settings.positionUsing === 'translate3d') {
      barCSS = { transform: 'translate3d('+toBarPerc(n)+'%,0,0)' };
    } else if (Settings.positionUsing === 'translate') {
      barCSS = { transform: 'translate('+toBarPerc(n)+'%,0)' };
    } else {
      barCSS = { 'margin-left': toBarPerc(n)+'%' };
    }

    barCSS.transition = 'all '+speed+'ms '+ease;

    return barCSS;
  }

  /**
   * (Internal) Queues a function to be executed.
   */

  var queue = (function() {
    var pending = [];
    
    function next() {
      var fn = pending.shift();
      if (fn) {
        fn(next);
      }
    }

    return function(fn) {
      pending.push(fn);
      if (pending.length == 1) next();
    };
  })();


  return NProgress;
});


/* @source m/model.js */;

define("m/model", [
  "tui/nprogress",
  "tui/dialog",
  "tui/event"
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
/* @source tui/countdown.js */;


define('tui/countdown', [], function(){
	return function(el, count, callback){
		var count = count || 3;
		var timer;
		var el = $(el).html(count);
		timer = setInterval(function(){
			count--;
			if (count <= 0) {
				clearInterval(timer);
				if (callback)
					callback();
			}
			el.html(count);
		}, 1000);

		return {
			close: function(){
				clearInterval(timer);
			}
		}
	}
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

/* @source tui/cookie.js */;


define('tui/cookie', [], function() {

	return function(win, n, v, op) {
		if(typeof win == "string") {
			op = v;
			v = n;
			n = win;
			win = window;
		}
		if(v !== undefined) {
			op = op || {};
			var date, expires = "";
			if(op.expires) {
				if(op.expires.constructor == Date) {
					date = op.expires;
				} else {
					date = new Date();
					date.setTime(date.getTime() + (op.expires * 24 * 60 * 60 * 1000));
				}
				expires = '; expires=' + date.toGMTString();
			}
			var path = op.path ? '; path=' + op.path : '';
			var domain = op.domain ? '; domain=' + op.domain : '';
			var secure = op.secure ? '; secure' : '';
			win.document.cookie = [n, '=', encodeURIComponent(v), expires, path, domain, secure].join('');
		} else {
			v = win.document.cookie.match( new RegExp( "(?:\\s|^)" + n + "\\=([^;]*)") );
			return v ? decodeURIComponent(v[1]) : null;
		}
	};

});

/* @source m/login.js */;


define("m/login", [
  "tui/cookie",
  "tui/event",
  "tui/art",
  "tui/dialog",
  "tui/html5form",
  "tui/countdown",
  "m/model"
], function(Cookie, Event, Art, Dialog, Html5form, Countdown, Model, require, exports){
	
	
	var domain = 'jishachengta.com.cn';
	var base_domain = window.base_domain || '';
	var Login = new Event();
	var navTpl = '欢迎访问集沙成塔 <a href="<%=domain%>/ucenter/" class="uname" target="_blank"><%=u_name%></a><a href="#" class="jsLogout">退出</a>\n|<a href="<%=domain%>/ucenter/order" target="_blank">支持的项目</a>';
	var navArt = Art.compile(navTpl);

	var loginTpl = '<h3>登录</h3>\n<a href="#" class="close" data-role="close">X</a>\n<form id="loginForm">\n<div class="l"><input class="tel" type="text" pattern= "^1[3|5|8|7|4|6]\\d{9}" placeholder="手机号" required /><i class="icon"></i></div>\n<div class="l"><input class="pwd" type="password" pattern="^\\w{6,}" placeholder="密码" required /><i class="icon icon2"></i></div>\n<p class="p"><a href="<%=url%>" target="_blank">忘记密码了？</a></p>\n<div class="btn">\n<a class="submit" href="#">登 录</a>\n</div>\n</form>\n<div class="foot">\n没有账户？<a href="#" target="_blank" class="b goreg">注册账户</a>\n</div>';
	var loginArt = Art.compile(loginTpl);

	var regTpl = '<h3>注册新账户</h3>\n<a href="#" class="close" data-role="close">X</a>\n<div class="l l2">已有账户？<a href="#" class="login">登录</a></div>\n<form id="regForm">\n<div class="l"><input class="tel" name="tel" type="text" pattern= "^1[3|5|8|7|4|6]\\d{9}" placeholder="请输入您的手机号(必填)" required /><i class="icon icon3"></i></div>\n<div class="l"><input class="username" name="username" type="text" placeholder="请输入您的真实姓名(必填)" required /><i class="icon"></i></div>\n<div class="l"><input class="pwd" name="pwd" type="password" placeholder="请设置密码，不少于6位(必填)" required /><i class="icon icon2"></i></div>\n<div class="l"><input class="ckpwd" name="checkpwd" type="password" placeholder="请再次输入密码(必填)" /><i class="icon icon2"></i></div>\n<div class="l"><input class="code" name="code" type="text" placeholder="请输入验证码(必填)" required /><a href="#" class="send">获取手机验证码</a></i></div>\n<div class="l"><input class="recmobile" name="recmobile" type="text" placeholder="请输入推荐人的手机号(选填)" /><i class="icon icon3"></i></div>\n<div class="btn">\n<a class="submit" href="#">提交注册</a>\n</div>\n</form>\n<div class="foot">\n注册即代表同意<a href="<%=domain%>/about/service" target="_blank" class="b">集沙成塔服务条款</a>\n</div>';
	var regArt = Art.compile(regTpl);

	var cookieSettings = { domain: domain, path: '/'};

	var mobileReg = /^1[3|5|8|7|4|6]\d{9}/;

	// writeCookie({
	// 	u_pic: 'http://u4.tdimg.com/1/121/16/129565489796808384508531606661958242731.jpg',
	// 	u_id: 123,
	// 	u_name: 'test'
	// });
	// console.log('123123123');
	// Cookie('RELEASE_VERSION', '2015_04_99', { domain: domain, path: '/', expires: 100});

	var u_id = Cookie('u_id');
	var u_name = Cookie('u_name');
	var u_pic = Cookie('u_pic');

	Login.isLogin = function(){
		u_id = Cookie('u_id');
		u_name = Cookie('u_name');
		u_pic = Cookie('u_pic');

		return (u_id && u_id != '0');

	};

	function noop(){}

	function writeCookie(op){
		op = op || {};

		u_pic = op.u_pic;
		u_id = op.u_id;
		u_name = op.u_name;

		Cookie('u_id', u_id, cookieSettings);
		Cookie('u_name', u_name, cookieSettings);
		Cookie('u_pic', u_pic, cookieSettings);

	}

	function delCookie(){
		Cookie('u_id', 0, {domain: domain, path: '/', expires : 'Thu, 01 Jan 1970 00:00:01 GMT'});
		Cookie('u_name', 0, {domain: domain, path: '/', expires : 'Thu, 01 Jan 1970 00:00:01 GMT'});
		Cookie('u_pic', 0, {domain: domain, path: '/', expires : 'Thu, 01 Jan 1970 00:00:01 GMT'});
	}

	function render(data, write){
		data.domain = base_domain;

		$('#gUser').html(navArt(data));

		write && writeCookie(data);
	}

	Login.autoLogin = function(op, callback){

		if(Login.isLogin()){
			render({
				u_id: u_id,
				u_name: u_name,
				u_pic: u_pic
			});
		}
	};


	Login.userInfo = function(){

		return Login.isLogin() ? {
			u_id : u_id,
			u_name : u_name,
			u_pic: u_pic
		}: false;
	};


	function toReg(op, callback) {
		
		var dlg = new Dialog({
			className : 'login_dialog reg_dialog',
			content : regArt({domain: base_domain})
		});

		var $content = dlg.dom.content;
		var $form = $content.find('form');
		var $tel = $form.find('.tel');
		var $pwd = $form.find('.pwd');
		var $ckpwd = $form.find('.ckpwd');
		var $uname = $form.find('.username');
		var $code = $form.find('.code');
		var $recmobile = $form.find('.recmobile');

		var h5form = new Html5form($form, Html5form.VALID_BLUR);
		var params = {};
		var phoneEnable;

		$content.on('click', '.submit', function(e){
			e.preventDefault();

			params.mobile =  $tel.val().trim();
			if(!mobileReg.test(params.mobile)){
				h5form.tip($tel, '请填写正确的手机号码');
				return;
			}

			if(!phoneEnable){
				h5form.tip($tel, '该手机号码已注册');
				return;
			}

			params.pwd =  $pwd.val().trim();
			if(!/^\w{6,}$/.test(params.pwd)){
				h5form.tip($pwd, '请输入至少六位数的密码');
				return;
			}

			params.ckpwd =  $ckpwd.val().trim();
			if(params.ckpwd  !== params.pwd ){
				h5form.tip($ckpwd, '两次输入的密码不一致');
				return;
			}

			params.realname =  $uname.val().trim();
			if(!params.realname.length){
				h5form.tip($uname, '请输入真实的姓名');
				return;
			}

			params.code =  $code.val().trim();
			if(!params.code.length){
				h5form.tip($code, '请输入手机验证码');
				return;
			}

			params.recmobile = $recmobile.val().trim();
			if(params.recmobile.length && !mobileReg.test(params.recmobile)){
				h5form.tip($recmobile, '请填写正确的手机号码');
				return;
			}

			params.act = 2;
			Model.postData(params, function(res){

				// render({
				// 	u_id : res.data.userId,
				// 	u_name : res.data.username || res.data.realname,
				// 	u_pic: 'http://u1.tdimg.com/u/U-01.gif'

				// }, true);
				Dialog.alert('注册成功，请重新登录。');

				callback && callback();
				dlg.close();
				h5form.clearAll();

			}, noop, true);

		}).on('click', '.login', function(e){
			e.preventDefault();
			dlg.close();
			h5form.clearAll();

			Login.needLogin();
		}).on('blur', '.ckpwd', function(){
			var val = $(this).val().trim();
			var pwd = $pwd.val().trim();

			if(val && val !== pwd){
				h5form.tip($ckpwd, '两次输入的密码不一致');
			}

		}).on('blur', '.tel', function(e){
			e.preventDefault();
			var me = $(this).val().trim();

			if(!mobileReg.test(me)){
				h5form.tip($tel, '请填写正确的手机号码');
				return;
			}

			if(phoneEnable) return;

			Model.getData({ act: 6, mobile: me },function(res){
				if(res.data == 1){
					h5form.tip($tel, '该手机号码已注册');
					phoneEnable = false;
				}else{
					phoneEnable = true;
				}
			});

		}).on('change', '.tel', function(e){
			phoneEnable = false;
		}).on('click', '.send', function(e){
			e.preventDefault();
			var me = $(this);

			if(!me.hasClass('sending')){
				sendCode(me, $tel, h5form);
			}
		});
	}

	function sendCode(node, ipt, h5form){
		var mobile = ipt.val().trim();

		if(!mobileReg.test(mobile)){
			h5form.tip(ipt, '请填写正确的手机号码');
			return;
		}
		
		node.html('<i>60</i>秒后可重新获取').addClass('sending');

		var $i = node.find('i');

		Countdown($i, 60, function(){
			node.html('获取手机验证码').removeClass('sending');
		});

		Model.getData({act: 5, mobile: mobile }, function(res){
			if(res.data){
				console.log(res.msg);
			}
		});
	}

	Login.needLogin = function(op, callback) {
		if(typeof op === 'function'){
			callback = op;
			op = {};
		}else{
			op = op || {};
		}

		if(Login.isLogin()){
			callback && callback();
			return;
		}

		if(op.reg){
			toReg(op, callback);
			return;
		}

		var dlg = new Dialog({
			className : 'login_dialog',
			content : loginArt({url: base_domain+ '/findpass/step1'})
		});

		var $content = dlg.dom.content;
		var $form = $content.find('form');
		var $tel = $form.find('.tel');
		var $pwd = $form.find('.pwd');

		var h5form = new Html5form($form, Html5form.VALID_BLUR);
		var params = {};

		$content.on('click', '.submit', function(e){
			e.preventDefault();
			params.username = $tel.val().trim();

			if(!mobileReg.test(params.username)){
				h5form.tip($tel, '请填写正确的手机号码');
				return;
			}

			params.password = $pwd.val().trim();
			if(!params.password.length){
				h5form.tip($pwd, '请输入密码');
				return;
			}

			params.act = 3;
			Model.postData(params, function(res){
				render({
					u_id : res.data.userId,
					u_name : res.data.username || res.data.realname,
					u_pic: 'http://u1.tdimg.com/u/U-01.gif'
				}, true);

				callback && callback();

				dlg.close();
				h5form.clearAll();
			}, noop, true);

		}).on('click', '.goreg', function(e){
			e.preventDefault();
			dlg.close();
			h5form.clearAll();

			toReg(op, callback);
		});
	};


	Login.exit = function(cb){

		Dialog.confirm('您确认要退出嘛？',function(){
		
			var isUsercenter = /ucenter/.test(location.pathname);

			Model.getData({act : 8}, function(){

				$('#gUser').html('欢迎访问集沙成塔<a class="login" href="#" id="gLogin" title="请登录">请登录</a>|<a class="reg" href="#" id="gReg" title="免费注册">免费注册</a>');

				delCookie();
				if(isUsercenter){
					location.reload();
				}

				if(cb) cb();

			}, noop, true);

		});
	};

	return Login;

});

/* @source m/nav.js */;

define("m/nav", [
  "tui/art",
  "m/login"
], function(Art, Login, require, exports) {
	
	Login.autoLogin();

	function g_dropdown_toggle() {
		$('.mini-nav').on('mouseenter', '.btn-qrcode', function() {
			$(this).find('.qrcode').css({height: 'auto'});
		}).on('mouseleave', '.sns', function() {
			$(this).find('.qrcode').css({height: '0'});
		});
	}

// function g_dropdown_toggle() {
// 		$('#gUser').on('mouseenter','.info', function() {
// 			$(this).addClass('active');
// 			$(this).find('.user-info').css({top: '60px'});
// 		}).on('mouseleave', '.info', function() {
// 			$(this).removeClass('active');
// 			$(this).find('.user-info').css({top: '-250px'});
// 		});
// 	}

	function login(){

		$('#gUser').on('click','#gLogin, #gReg', function(e){
			e.preventDefault();

			var id = $(this).attr('id');

			Login.needLogin({reg: id == 'gReg'});

		}).on('click', '.jsLogout', function(e){
			e.preventDefault();
			Login.exit();

		});

	}

	exports.init = function() {
		login();

		g_dropdown_toggle();

	};


});
/* @source  */;

require(['m/nav', 'module/odometer', 'module/slider', 'tui/util/num'], function(Nav, Odometer, Slider, Num) {
	Nav.init();

	window.odometerOptions = {
		format: '(,ddd)'
	};


	var $focus = $('#jsFocus');
	var slider = new Slider({
		box: $focus,
		tab: '.btns a',
		panel: 'li',
		fade: true,
		duration: 500,
		loop: 5000
	});

	$focus.on('click', '.prev', function(e){
		e.preventDefault();
		prev();

	}).on('click', '.next', function(e){
		e.preventDefault();
		next();
	}).on('mouseenter', function(){
		$(this).addClass('hover');
		slider.stop();
	}).on('mouseleave', function(){
		$(this).removeClass('hover');
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



	//
	if($.browser.msie && $.browser.version == '6.0') {
		document.execCommand('BackgroundImageCache', false, true);
	}

	var isIE = $.browser.msie && parseInt($.browser.version < 8);

	$('.odometer').each(function(i, item) {
		var num = $(item).attr('data-num');

		if(!isIE){
			var od = new Odometer({
				el: item,
				value: 0
			});

			od.update(num)

		}else{
			$(item).text(Num.split(num));
		}

	});



});

})(window.jQuery);

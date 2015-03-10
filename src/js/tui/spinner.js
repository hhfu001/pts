/**
 * @overview 数值微调控件
 *
 * @author Chunjie
 * @version 2014-11-10
 */

define('tui/spinner', [
	'tui/art',
	'tui/widget'
], function(Art, Widget) {

	var template = ['<span class="ui_spinner">',
		'<input type="text" class="ui_spinner_input" autocomplete="off" role="spin" />',
		'<a class="ui_spinner_btn ui_spinner_up" role="up"><i class="iconfont">&#xe641;</i></a>',
		'<a class="ui_spinner_btn ui_spinner_down" role="down"><i class="iconfont">&#xe604;</i></a>',
	'</span>'].join('');
	var E_CHANGE = 'change';
	var reg = /^-*\d+(\.\d+)*$/;
	var defaults = {
		element: null,
		template: template,
		step: 1, //调整间隔
		min: null,  //最小值
		max: null,  //最大值
		initial: null,  //初始值
		fix: 0 //小数位
	};

	var K = Widget.extend({
		initialize : function(config){
			var self = this;
			config = self.cfg = $.extend(defaults, config || {});
			K.superClass.initialize.call(self, config);
			self.timer = null;
			self.spinning = false;
			self._previusValue = undefined; //按键时的数值
			self._keydownTimer = null;
			self.element = $(Art.compile(config.template)(config));
			self._draw();
		},
		_draw: function(){
			var self = this;
			var initial = self.cfg.initial;
			self.render();
			self.dom = {
				input: $('[role="spin"]', self.element),
				btn: $('[role="up"], [role="down"]', self.element)
			}
			if(initial !== null){
				self.val(initial);
			}
			self._bindEvents();
		},
		_bindEvents: function(){
			var self = this;
			var $el = self.element;
			self.dom.btn.click(self._btnClick.bind(self));
			self.dom.input.on({
				'keydown': self._keydown.bind(self),
				'keyup': self._keyup.bind(self)
			});
		},
		_keydown: function(e){
			var self = this;
			self._keydownTimer && clearTimeout(self._keydownTimer);
			self._keydownTimer = setTimeout(function(){
				var val = self.val();
				var currentValue = e.currentTarget.value;
				switch(e.keyCode){
					case 38:  //↑
						val += self.cfg.step;
						self._setValue(val);
						return false;
					case 40:  //↓
						val -= self.cfg.step;
						self._setValue(val);
						return false;
				};
				if(!reg.test(currentValue)){
					self.val(self._previusValue);
				}
			}, 30);
		},
		_keyup: function(e){
			var self = this;
			if(self.val() === null){
				self.val(self._previusValue);
			}
			if(self.val() !== null && !self.spinning){
				self._change();
			}
		},
		_btnClick: function(e){
			e.preventDefault();
			e.stopPropagation();
			var self = this;
			var steps = $(e.currentTarget).attr('role') === 'up' ? 1 : -1;
			var val = self.val() || 0;
			val += steps * self.cfg.step
			self._setValue(val);
			self._change();
			self._focus();
		},
		_change: function(gap){
			var self = this;
			var val = self.val();
			if(reg.test(val)){
				val += gap || 0;
				val = self._fix(val);
				self.spinning = true;
				self.timer && clearTimeout(self.timer);
				self.timer = setTimeout(function(){
					self._set(val);
				}, 30);
			}
		},
		_set: function(val){
			var self = this;
			self._setValue(val);
			self.fire(E_CHANGE, [val]);
			self.spinning = false;
		},
		_setValue: function(val){
			var self = this;
			val = self._fixValue(val);
			self.val(val);
		},
		_fixValue: function(value){
			var self = this;
			var cfg = self.cfg;
			if(cfg.min !== null && value < cfg.min){
				return self._fix(cfg.min);
			}
			if(cfg.max !== null && value > cfg.max){
				return self._fix(cfg.max);
			}
			return value;
		},
		_focus: function(){
			this.dom.input.focus();
		},
		_fix: function(val){
			var fix = this.cfg.fix;
			val = Math.round(val * Math.pow(10, fix)) / Math.pow(10, fix);
			return val;
		},
		_checkDisableBtn: function(){
			var self = this;
			var value = self._previusValue;
			var $btns = self.dom.btn;
			var cfg = self.cfg;
			var DISABLED = 'disabled';
			if(value === cfg.min){
				$btns.filter('[role="down"]').addClass(DISABLED);
			}else if(value === cfg.max){
				$btns.filter('[role="up"]').addClass(DISABLED);
			}else{
				$btns.removeClass(DISABLED);
			}
		},
		up: function(steps){
			this._change((steps || 1) * this.cfg.step);
		},
		down: function(steps){
			this._change((steps || 1) * -this.cfg.step);
		},
		val: function(value){
			var self = this;
			var cfg = self.cfg;
			var belowMax = true;
			var aboveMin = true;
			if(value !== undefined){
				value = self._fix(value);
				self.dom.input.val(value);
				self._previusValue = value;
				self._checkDisableBtn();
			}else{
				var value = self.dom.input.val();
				var parsed = parseFloat(value);
				belowMax = cfg.max !== null ? parsed <= cfg.max : belowMax;
				aboveMin = cfg.min !== null ? cfg.min <= parsed : aboveMin;
				if(reg.test(value) && belowMax && aboveMin){
					return parsed;
				}else{
					return null;
				}
			}
		}
	});

	return K;
});

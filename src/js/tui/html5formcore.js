define('tui/html5formcore', ['tui/event', './limitTextarea', './placeholder'], function(Event, LimitTextarea, Placeholder) {
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

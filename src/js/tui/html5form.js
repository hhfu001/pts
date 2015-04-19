define('tui/html5form', ['./template', './html5formcore', './placeholder'], function(template, Html5formcore, Placeholder) {
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
					left: item.offset().left + 200,
					top: item.offset().top + 7
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

/**
 * 全站Tab切换、滚动Banner
 */
define(['tui/event'], function(Event) {


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
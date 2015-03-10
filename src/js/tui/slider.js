
define('tui/slider', [
	'tui/art',
	'tui/widget',
	'tui/drag'
], function(Art, Widget, Drag) {

	var template = ['<div class="tui_slider <%=className%>">',
		'<div class="tui_slider_range" data-role="range"></div>',
		'<a class="tui_slider_handle" href="#" data-role="handle" hidefocus="true"></a>',
		'<%if(useTips){%><div class="tui_slider_tips" data-role="tips"></div><%}%>',
		'</div>'].join('');

	var Slider = Widget.extend({
		// 构造方法
		initialize : function(config) {
			var self = this;

			var defaults = {
				template : template,
				className : '',
				useTips : true,
				value : 0,
				min : 0,
				max : 100,
				speed : 200
			};

			config = $.extend(defaults, config || {});

			config.element = $(Art.compile(config.template)(config));

			Slider.superClass.initialize.call(self, config);

			self.dom = {
				range : self.find('[data-role=range]'),
				handle : self.find('[data-role=handle]'),
				tips : self.find('[data-role=tips]')
			};

			self.config = config;

			self.create();
		},
		create : function() {
			var self = this;
			var config = self.config;

			self.val(config.value);
			self.render();

			// Bugfix：拖动结束后会触发点击拖动事件，导致拖动后有轻微移动的动作。
			self.dom.handle.click(function() {
				return false;
			});

			var width = config.width || self.element.width();
			var handleWidth = config.handleWidth || self.dom.handle.width();

			// 拖动
			var isDragging = false;
			var drag = new Drag(self.dom.handle, {
				isCustom : true
			});
			drag.bind('drag:start', function() {
				isDragging = true;
			});
			drag.bind('drag:move', function(x, y) {
				var percent = (x + handleWidth / 2) / width * 100;

				var val = self._toVal(percent);

				self.val(val);

				self.trigger('change', [val]);
			});
			drag.bind('drag:end', function(x, y) {
				isDragging = false;
			});

			// 点击移动
			self.element.click(function(e) {
				if (isDragging) {
					return;
				}
				var x = e.pageX - self.element.offset().left;
				var percent = x / width * 100;

				var val = self._toVal(percent);

				self.val(val, true);

				self.trigger('change', [val]);
			});

			return self;
		},
		remove : function() {
			var self = this;
			self.element.remove();
			return self;
		},
		val : function(val, hasAnimate) {
			var self = this;
			var config = self.config;

			if (typeof val == 'undefined') {
				return parseInt(self.dom.handle.attr('data-val'), 10);
			}

			var percent = self._toPercent(val);

			if (hasAnimate) {
				self.dom.range.animate({
					width : percent + '%'
				}, config.speed);

				self.dom.handle.animate({
					left : percent + '%'
				}, config.speed).attr('data-val', val);

				if (config.useTips) {
					self.dom.tips.animate({
						left : percent + '%'
					}, config.speed).html(val + '%');
				}
			} else {
				self.dom.range.width(percent + '%');
				self.dom.handle.css('left', percent + '%').attr('data-val', val);
				if (config.useTips) {
					self.dom.tips.css('left', percent + '%').html(val + '%');
				}
			}
			return self;
		},
		_toPercent : function(val) {
			var self = this;
			var config = self.config;

			val < config.min && (val = config.min);
			val > config.max && (val = config.max);

			return Math.round(100 / (config.max - config.min) * (val - config.min));
		},
		_toVal : function(percent) {
			var self = this;
			var config = self.config;

			percent > 100 && (percent = 100);
			percent < 0 && (percent = 0);

			return Math.round(percent * (config.max - config.min) / 100 + config.min);
		}
	});

	return Slider;
});

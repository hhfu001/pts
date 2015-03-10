
define('tui/dialog', [
	'tui/browser',
	'tui/art',
	'tui/mask',
	'tui/widget',
	'tui/drag'
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

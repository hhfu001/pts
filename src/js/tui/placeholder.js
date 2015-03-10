define('tui/placeholder', ['tui/event'], function(Event) {
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

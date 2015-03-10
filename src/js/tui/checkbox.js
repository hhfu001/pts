
define('tui/checkbox', [
	'tui/event'
], function(Event) {

	function check(box, bool) {
		var check = box.closest('label').find('.tui_checkbox_check');

		box.prop('checked', bool);

		if (bool) {
			check.addClass('tui_checkbox_checked');
		} else {
			check.removeClass('tui_checkbox_checked');
		}
	}

	var Checkbox = Event.extend({
		// 构造方法
		initialize : function(expr) {
			var self = this;

			Checkbox.superClass.initialize.call(self);

			var labelList = self.labelList = $(expr);

			labelList.attr('data-stat-role', 'ck');
			labelList.prepend('<span class="tui_checkbox_check"></span>');

			self.update();

			labelList.click(function(e) {
				e.preventDefault();

				var label = $(this);
				var box = label.find(':checkbox');
				check(box, !box.prop('checked'));

				self.trigger('click', [label]);
			});
		},
		update : function() {
			var self = this;

			self.labelList.each(function() {
				var label = $(this);
				var box = label.find(':checkbox');

				check(box, box.prop('checked'));
			});
		}
	});

	return Checkbox;
});

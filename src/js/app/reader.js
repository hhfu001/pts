define([
	'tui/widget',
	'tui/scrollbar',
	'tui/art'
], function(Widget, Scrollbar, Art) {

	var tpl = require.text('./reader.tpl');

	var klass = Widget.extend({
		// 事件代理
		events: {
			'click [data-role=close]': 'close'
		},
		template: tpl,
		// 构造方法
		initialize: function(config) {

			klass.superClass.initialize.call(this, config);

			

		},
		close: function(e){
			e.preventDefault();

			this.element.remove();
			this.element = null;
			this.trigger('close', []);
		}
	});

	return klass;

});
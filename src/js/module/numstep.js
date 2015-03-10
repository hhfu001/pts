define([
	'tui/html5form',
	'tui/event'
], function(Html5form, Event, require, exports) {

	var klass = Event.extend({
		initialize: function(op){

			var node = $(op.node).find('[data-role="numstep"]'); //节点
			var step = parseInt(op.step || 1, 10); //步长

			var self = this;
			var ipt = node.find('input');
			var current = +ipt.val();

			var h5form = new Html5form(node.closest('form'));

			klass.superClass.initialize.apply(self, arguments);


			if(node[0]){

				node.on('click', '[data-role="minus"]', function(e) {
					e.preventDefault();

					if (current - step > 0) {
						current = current - step;
						self.trigger('num:step', [current]);
						ipt.val(current);
					}

				}).on('click', '[data-role="plus"]', function(e) {
					e.preventDefault();

					current = current + step;

					self.trigger('num:step', [current]);
					ipt.val(current);

				}).on('keyup', ipt, function(){
					current =  parseInt(ipt.val(), 10);

					if(!current || typeof current !== 'number' || current < 1){
						h5form && h5form.tip(ipt, '请输入正整数!');
						return;
					}

					self.trigger('num:step', [current]);
					ipt.val(current);

				});

			}

		}
	});

	return klass;

});
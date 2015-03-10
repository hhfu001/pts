define('tui/autolinetextarea', ['tui/event', 'tui/art'], function(Event, Art){
	var ie9 = $.browser.msie && $.browser.version == '9.0';
	var div = $('<div>');
	var Klass = Event.extend({
		initialize: function(ta, min, max){
			var self = this;
			Klass.superClass.initialize.apply(self, arguments);
			$(document.body).append(div);
			div.css({
				position: 'absolute'
				, 'white-space': 'pre-wrap'
				, top: 0
				, left:'-99999em'
				, 'width': ta.width()
				, 'font-family': ta.css('font-family')
				, 'line-height': ta.css('line-height')
				, 'font-size': ta.css('font-size')
			});
			if (min === undefined) {
				min = ta.height();
			}
			function input(e){
				div.html(Art.helpers.$escape(ta.val()).replace(/\n/g, '<br/>&nbsp;'));
				var h = div.height();
				if (min !== undefined) {
					h = Math.max(min, h);
				}
				if (max !== undefined) {
					h = Math.min(max, h);
				}
				ta.css('height', h);
			}
			if (window.addEventListener) {
				ta.bind('input', input);
				if (ie9) ta.bind('keydown cut paste', input);
			}
			else ta.bind('keydown contextmenu', input);
		}
	});
	return Klass;
});

define('tui/key', ['tui/event'], function(Event){
	var k = Event.extend({
		initialize: function(){
			var self = this;
			k.superClass.initialize.call(this);
			$(document).keydown(function(e){
				if(!self.filter(e)) return true;
				var ret = self.firing('_' + e.keyCode);
				if(ret === false)return false;
			});
		},
		filter: function(e){
			var tagName = (e.target || e.srcElement).tagName;
				forbids = {
					'input': 1,
					'textarea': 1,
					'select': 1,
					'object': 1,
					'embed': 1
				};
			return !forbids[tagName.toLowerCase()];
		}
	});
		
	return k;
});


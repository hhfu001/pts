define('tui/hashchange', ['tui/event'], function(Event, require, exports, module) {
	var id = 0,
		orignal = ('onhashchange' in window) && (document.documentMode === undefined || document.documentMode >= 8);
	var Klass = Event.extend({
		initialize: function(src) {
			var self = this;
			Klass.superClass.initialize.call(this);
			self.id2 = id++;
			self.src2 = src;
			if(orignal) {
				$(window).bind('hashchange', function() {
					self.trigger('hashChange', location.hash.replace(/^#+/, ''));
				});
			}
			else {
				self.iframe2 = $('<iframe id="hashchangeiframe" src="' + src + '" style="position:absolute;left:-9999px;width:0;height:0;visibility:hidden;">');
				$(document.body).append(self.iframe2);
			}
			Klass.obj = self;
		},
		add: function(url) {
			if(!orignal){
				var self = this,
					doc = self.iframe2[0].contentWindow.document;
				doc.open();
				doc.write([
					'<!DOCTYPE html><html><head><script>document.domain="tudou.com";',
						'function l() {',
							'parent.require("' + (module.id || module.uri) + '", function(hashChange) {',
								'hashChange.obj.trigger("hashChange", "' + url + '");',
							'});',
						'}',
					'</scr',
					'ipt></head><body onload="l()"></body></html>'
				].join(''));
				doc.title = 'hashchange';
				doc.close();
			}
		}
	});
	return Klass;
});

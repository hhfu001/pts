define('tui/limitTextarea', ['tui/event'], function(Event) {
	var ie9 = $.browser.msie && $.browser.version == '9.0';
	function virtualTextareaMaxlength(item) {
		var max = parseInt(item.attr('maxlength')),
			v = item.val();
		if(!isNaN(max) && v.length > max) {
			var i,
				bookmark,
				oS = document.selection.createRange(),
				oR = document.body.createTextRange();
			oR.moveToElementText(item[0]);
			bookmark = oS.getBookmark();
			for (i = 0; oR.compareEndPoints('StartToStart', oS) < 0 && oS.moveStart("character", -1) !== 0; i++)
				//ie的换行是\r\n，算2个字符长度
				if(v.charAt(i) == '\n')
					i++;
			item.val(v.substr(0, Math.min(max, i - 1)) + v.substr(i, Math.min(max, v.length)));
			//模拟光标位置
			if(v.length != i) {
				var range = item[0].createTextRange();
				range.collapse(true);
				range.moveEnd('character', i - 1);
				range.moveStart('character', i - 1);
				range.select();
			}
		}
	}
	function cb(self, item) {
		var v = item.val();
		self.trigger('input', [v.length, parseInt(item.attr('maxlength'))]);
	}
	var Klass = Event.extend({
		initialize: function(item) {
			var self = this;
			Klass.superClass.initialize.apply(self, arguments);
			if($.type(item) == 'string')
				item = $(item);
			if(window.addEventListener) {
				item.bind('input', function() {
					if(ie9)
						virtualTextareaMaxlength(item);
					cb(self, item);
				});
				//ie9对于delete、backspace、剪切、粘帖不支持，需hack
				if(ie9)
					item.bind('keydown cut paste', function(e) {
						switch(e.type) {
							case 'keydown':
								if(e.keyCode != 46 && e.keyCode != 8)
									return;
							default:
								setTimeout(function() {
									virtualTextareaMaxlength(item);
									cb(self, item);
								}, 0);
						}
					});
			}
			else {
				item.bind('propertychange', function() {
					virtualTextareaMaxlength(item);
					cb(self, item);
				});
			}
		}
	});
	return Klass;
});

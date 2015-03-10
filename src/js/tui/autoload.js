define('tui/autoload', [], function() {

	var win = $(window);
	var doc = $(document);

	function Autoload(options) {
		var defaults = {
			times : 3, // 加载次数
			diff : 200 // 离底部的距离
		};

		this.times = 0;
		this.options = $.extend(defaults, options || {});
	};

	Autoload.prototype.bind = function(callback) {
		var self = this;

		if (self.times >= self.options.times) {
			return;
		}

		function scrollHandler() {
			if (win.height() + win.scrollTop() >= doc.height() - self.options.diff) {
				self.times++;
				win.off('scroll', scrollHandler);
				callback();
			}
		}

		win.on('scroll', scrollHandler);
	};

	return Autoload;
});

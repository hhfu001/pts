
define('tui/mask', [], function() {
	var $node = $('<div class="tui_mask">');
	var init;
	var $win = $(window);
	var $doc = $(document);
	var $body = $(document.body);
	var ie6 = $.browser.msie && $.browser.version < 7;
	var ieMaxHeight = 4096;

	function cb() {
		var width = Math.max($win.width(), $doc.width());
		var height = Math.max($win.height(), $doc.height());
		var position = 'absolute';
		var top = 0;

		// Bugfix: http://jira.intra.tudou.com/browse/FLASH-3072
		if ($.browser.msie && height > ieMaxHeight) {
			if (!ie6) {
				position = 'fixed';
			} else {
				top = $win.scrollTop();
				if (top + ieMaxHeight > height) {
					top = height - ieMaxHeight;
				}
			}
			height = ieMaxHeight;
		}

		$node.css({
			position : position,
			top : top,
			width: width,
			height: height
		});
	}

	return {
		node: function() {
			return $node;
		},
		resize: function() {
			cb();
		},
		show: function(zIndex) {
			$win.bind('resize', cb);
			if (ie6) {
				$win.bind('scroll', cb);
			}
			$node.css('z-index', zIndex || 90000);
			this.resize();
			if(!init) {
				$body.append($node);
				init = true;
			}
			else
				$node.show();
			return this;
		},
		hide: function(remove) {
			$win.unbind('resize', cb);
			if (ie6) {
				$win.unbind('scroll', cb);
			}
			if(remove) {
				$node.remove();
				init = false;
			}
			else
				$node.hide();
			return this;
		},
		update: function() {
			cb();
		},
		state: function() {
			return $node.is(':visible');
		}
	};
});

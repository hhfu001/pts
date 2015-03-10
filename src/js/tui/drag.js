
define('tui/drag', ['tui/event'], function(Event) {

	var win = $(window);

	function clearSelection() {
		if(window.getSelection)
			window.getSelection().removeAllRanges();
		else if(document.selection)
			document.selection.empty();
		return this;
	}

    function selectListener(e){
        e.preventDefault();
    }

	var Klass = Event.extend({
		initialize : function(node, options) {
			var self = this;
			options = options || {};
			var handler = options.handler || node;
			Klass.superClass.initialize.call(self);
            self.limit = options.limit;

            self.bubble = options.bubble;
            self.isCustom = options.isCustom;
			self.enable2 = true;
			self.state2 = false;
			self.hasMove2 = false;
			self.fx = self.fy = -1;
			self.x2 = self.y2 = self.mx2 = self.my2 = self.px2 = self.py2 = self.cx2 = self.cy2 = 0;
			self.node2 = $.type(node) == 'string' ? $(node) : node;
			self.container2 = options.container || self.node2.parent();
			self.fixed2 = self.node2.css('position').toLowerCase() == 'fixed';
			self.handler2 = $.type(handler) == 'string' ? $(handler) : handler;

			//init
            var h = self.handler2 || self.node2;

			function onDown(e) {
				e.preventDefault();

				if(!self.bubble || e.target == h[0]) {
					self.start(e);
					if (h[0].setCapture) {
						h[0].setCapture();
					}
				}
			}
			h.bind('mousedown', onDown);
			function onUp(e) {
				//e.preventDefault();
				if(self.state2) {
					self.state2 = false;
					var x = e.pageX - self.mx2 + self.x2 - self.px2,
						y = e.pageY - self.my2 + self.y2 - self.py2;
					if(self.fixed2) {
						x -= win.scrollLeft();
						y -= win.scrollTop();
					}
					if(self.limit) {
                        x = Math.max(x, self.cx2 - self.px2);
                        y = Math.max(y, self.cy2 - self.py2);
                        x = Math.min(x, self.cWidth - (self.px2 - self.cx2) - self.dWidth);
                        y = Math.min(y, self.cHeight - (self.py2 - self.cy2) - self.dHeight);
					}
					self.x2 = self.node2.offset().left;
					self.y2 = self.node2.offset().top;
					self.trigger('drag:end', [x, y, e.pageX, e.pageY, self.node2, self.container2]);
				}
				$(document).unbind('selectstart', selectListener);
				if (h[0].releaseCapture) {
					h[0].releaseCapture();
				}
			}
			$(document).bind('mouseup', onUp);
			function onMove(e) {
				//e.preventDefault();
				if(self.state2 && self.enable2) {
					if(!self.hasMove() && e.pageX == self.fx && e.pageY == self.fy) {
						//chrome下有几率发生尚未移动就触发了mousemove
					} else {
						self.hasMove2 = true;
					}
					var x = e.pageX - self.mx2 + self.x2 - self.px2,
						y = e.pageY - self.my2 + self.y2 - self.py2;
					if(self.fixed2) {
						x -= win.scrollLeft();
						y -= win.scrollTop();
					}
					if(self.limit) {
                        x = Math.max(x, self.cx2 - self.px2);
                        y = Math.max(y, self.cy2 - self.py2);
                        x = Math.min(x, self.cWidth - (self.px2 - self.cx2) - self.dWidth);
                        y = Math.min(y, self.cHeight - (self.py2 - self.cy2) - self.dHeight);
					}
					if (!self.isCustom) {
						self.node2.css({
							left: x,
							top: y
						});
					}
					//清理文本选中
					clearSelection();
					self.trigger('drag:move', [x, y, e.pageX, e.pageY, self.node2, self.container2]);
				}
			}
			$(document).bind('mousemove', onMove);

			//清除侦听方法，防止内存泄?
			self.cancel = function() {
				h.unbind('mousedown', onDown);
				$(document).unbind('mouseup', onUp);
				$(document).unbind('mousemove', onMove);
			}
		},
		start: function(e) {
			var self = this;
			$(document).bind('selectstart', selectListener);
			
			self.offsetParent2 = self.node2.offsetParent();
			
            if (self.limit) {
                self.cWidth = self.container2.outerWidth();
                self.cHeight = self.container2.outerHeight();
				self.pWidth = self.offsetParent2.outerWidth();
                self.pHeight = self.offsetParent2.outerHeight();
                self.dWidth = self.node2.outerWidth();
                self.dHeight = self.node2.outerHeight();
            }

			self.fx = e.pageX;
			self.fy = e.pageY;
			self.cx2 = self.container2.offset().left;
			self.cy2 = self.container2.offset().top;
			self.px2 = self.offsetParent2.offset().left;
			self.py2 = self.offsetParent2.offset().top;
			self.x2 = self.node2.offset().left;
			self.y2 = self.node2.offset().top;
			self.mx2 = e.pageX;
			self.my2 = e.pageY;
			self.state2 = true;
			self.trigger('drag:start', [self.x2, self.y2, e.pageX, e.pageY, self.node2, self.container2]);
			return this;
		},
		enable: function() {
			this.enable2 = true;
			return this;
		},
		disable: function() {
			this.enable2 = false;
			return this;
		},
		state: function() {
			return this.state2;
		},
		hasMove: function() {
			return this.hasMove2;
		}
	});

	return Klass;
});

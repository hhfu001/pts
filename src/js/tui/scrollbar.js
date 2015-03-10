define('tui/scrollbar', ['tui/event', 'tui/drag'], function(Event, Drag){
    var Klass = Event.extend({
        initialize: function(content, options){
            options = options || {};
            var self = this;
            Klass.superClass.initialize.apply(self, arguments);

			self.isShow = false;
            //滚动条最小宽/高值
            self.barMinSize = options.barMinSize || 60;
            //鼠标滚轮一次滚动大小
            self.wheelDelta = options.wheelDelta || 60;
            //prev or next 一次滚动大小
            self.prevNextDelta = options.prevNextDelta || self.wheelDelta;
            //滚动方向
            self.horizontalScroll = options.horizontalScroll || false;
            
            var isHorizontal = self.horizontalScroll;
            var $content = $(content);
            var $container = options.container || $content.parent();
            var $scrollbar = options.scrollbar || $('<div class="scrollbar_container"><a href="#" class="scrollbar_prev"></a><div class="scrollbar_track"><span class="scrollbar_bar"></span></div><a href="#" class="scrollbar_next"></a></div>');
            var $track = $scrollbar.find('.scrollbar_track');
            var $bar = $scrollbar.find('.scrollbar_bar');
            var $prev = $scrollbar.find('.scrollbar_prev');
            var $next = $scrollbar.find('.scrollbar_next');
            if (!options.scrollbar) {
                $container.after($scrollbar);
            }
            
            //拖动
            var oDrag = new Drag($bar, {
                limit: true
            });
            oDrag.bind('drag:move', function(x, y){
                self.scrollTo(self.horizontalScroll ? x : y);
            });
            
            //滚动
            $container.bind('scroll', function(e){
                self.updateBarPosition();
            });
            
            //滚轮
            if ($.browser.mozilla) {
                $container[0].addEventListener('DOMMouseScroll', function(e){
                    var wheelDelta = e.detail > 0 ? self.wheelDelta : -self.wheelDelta;
					$container[0][isHorizontal ? 'scrollLeft' : 'scrollTop'] += (wheelDelta * self._wheelRate);
					if(self.isShow){
						e.preventDefault();
					}
                }, false);
            }
            else {
                $container[0].onmousewheel = function(e){
                    e = e || window.event;
                    var wheelDelta = e.wheelDelta > 0 ? -self.wheelDelta : self.wheelDelta;
					$container[0][isHorizontal ? 'scrollLeft' : 'scrollTop'] += (wheelDelta * self._wheelRate);
					if(self.isShow){
						e.returnValue = false;
						return false;
					}
                }
            }
            
            //点击
			$bar.click(function(e){
				e.stopPropagation();
			});
			$track.click(function(e){
				e.preventDefault();
				self.scrollTo(e[isHorizontal ? 'pageX' : 'pageY'] - $track.offset()[isHorizontal ? 'left' : 'top'] - self._barSize / 2);
			});
            $prev.click(function(e){
                e.preventDefault();
                $container[0][isHorizontal ? 'scrollLeft' : 'scrollTop'] -= self.prevNextDelta;
            });
            $next.click(function(e){
                e.preventDefault();
                $container[0][isHorizontal ? 'scrollLeft' : 'scrollTop'] += self.prevNextDelta;
            });
            
            self.content = $content;
            self.container = $container;
            self.scrollbar = $scrollbar;
            self.track = $track;
            self.prev = $prev;
            self.next = $next;
            self.bar = $bar;
            
            self._contentSize = 0;
            self._containerSize = 0;
            self._trackSize = 0;
            self._barSize = 0;
            
            self.update();
            //self.container.trigger('scroll');
        },
        updateBarPosition: function(){
            var isHorizontal = this.horizontalScroll;
            var d = this.container[isHorizontal ? 'scrollLeft' : 'scrollTop']();
            var pos = (d * this._trackSize - d * this._barSize) / (this._contentSize - this._containerSize);
            pos = pos ? pos : 0;
            this.bar.css(isHorizontal ? 'left' : 'top', pos);
            if (pos >= this._trackSize - this._barSize) {
                this.trigger('scroll:end');
            }
        },
        scrollTo: function(d, isScrollTop){
            var isHorizontal = this.horizontalScroll;
            var pos = isScrollTop ? d : (d * this._contentSize - d * this._containerSize) / (this._trackSize - this._barSize);
            this.container[isHorizontal ? 'scrollLeft' : 'scrollTop'](pos ? pos : 0);
        },
        update: function(){
            this.show();
            
            var isHorizontal = this.horizontalScroll;
            var fname = isHorizontal ? 'width' : 'height';
            
			this._contentSize = this.content[isHorizontal ? 'innerWidth' : 'innerHeight']();
			this._containerSize = this.container[fname]();
			this._trackSize = this.track[fname]();
			
			// 滚动速率，内容越短，单次滚动越少
			this._wheelRate = Math.min(Math.atan(this._contentSize / 3000), 1);
            
            if (this._contentSize > this._containerSize) {
                this._barSize = Math.floor(this._containerSize * this._trackSize / this._contentSize);
                this._barSize = Math.max(this._barSize, this.barMinSize);
                this.bar.css(fname, this._barSize);
                this.updateBarPosition();
            }
            else {
                this.hide();
            }
        },
        show: function(){
			this.isShow = true;
            this.scrollbar.show();
            this.trigger('show');
        },
        hide: function(){
			this.isShow = false;
            this.scrollbar.hide();
            this.trigger('hide');
        }
    });
    return Klass;
});

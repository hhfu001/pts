define('tui/scrollbar2', ['tui/event', 'tui/drag', 'tui/art', 'tui/easing2'], function(Event, Drag, Art){
	var Klass = Event.extend({
		initialize: function(container, options){
			options = options || {};
			Klass.superClass.initialize.apply(this, arguments);
			var self = this;
			var defaultConfig = {
				horizontalScroll: false,
				horizontalMaxSize: 100000,
				prefix: '', //class前缀
				autoHide: true, //不满一屏update时自动隐藏滚动条
				targetNode: null,
				renderMethod: 'after',
				barContainerNode: null, //滚动条容器节点
				animate: false,
				duration: 950,
				easing: 'mcsEaseOut',
				arrowEnable: false, //上下左右箭头按钮
				arrowDelta: 60,
				arrowPrevNode: null,
				arrowNextNode: null,
				draggerNode: null, //滚动条节点元素
				draggerMaxLength: null, //滚动条最大宽高
				draggerMinLength: 60, //滚动条最小宽高
				draggerAutoLength: true, //滚动条自动宽高
				trackEnable: true, //点击轨道滚动
				trackNode: null,
				mouseWheelEnable: true, //鼠标滚轮
				mouseWheelDelta: 100,
				keyPressEnable: false,
				keyPressDelta: 60
			};
			$.extend(true, self, defaultConfig, options);
			$.extend(true, self, {
				arrowAnimate: {
					enable: self.animate,
					duration: self.duration,
					easing: self.easing
				},
				mouseWheelAnimate: {
					enable: self.animate,
					duration: self.duration,
					easing: self.easing
				},
				draggerAnimate: {
					enable: self.animate,
					duration: self.duration,
					easing: self.easing
				},
				trackAnimate: {
					enable: self.animate,
					duration: self.duration,
					easing: self.easing
				},
				keyPressAnimate: {
					enable: self.animate,
					duration: self.duration,
					easing: self.easing
				}
			}, options);

			var $container = $(container);
			var prefix = (self.prefix && self.prefix != '') ? self.prefix + '_' : '';
			var $barContainer = self.barContainerNode ? $(self.barContainerNode) : $(Art.compile(options.template || '<div class="<%=prefix%>scrollbar_container"><a class="<%=prefix%>scrollbar_prev" href="#"><i></i></a><div class="<%=prefix%>scrollbar_track"><span class="<%=prefix%>scrollbar_dragger"></span></div><a class="<%=prefix%>scrollbar_next" href="#"><i></i></a></div>')({
				prefix: prefix
			}));
			var $dragger = self.draggerNode ? $(self.draggerNode) : $barContainer.find('.' + prefix + 'scrollbar_dragger');
			var $track = self.trackNode ? $(self.trackNode) : $barContainer.find('.' + prefix + 'scrollbar_track');
			var $prev = self.arrowPrevNode ? $(self.arrowPrevNode) : $barContainer.find('.' + prefix + 'scrollbar_prev');
			var $next = self.arrowNextNode ? $(self.arrowNextNode) : $barContainer.find('.' + prefix + 'scrollbar_next');
			var $targetNode = self.targetNode || $container;

			//render
			if (!self.barContainerNode) {
				$targetNode[self.renderMethod]($barContainer);
			}

			//dragger拖动滚动
			var oDrag = new Drag($dragger, {
				limit: true
			});
			oDrag.bind('drag:move', function(x, y){
				self.scrollTo(self.horizontalScroll ? x : y, true, self.draggerAnimate);
			});

			//滚动事件
			$container.bind('scroll', function(e){
				var scrollPos = $container[self.horizontalScroll ? 'scrollLeft' : 'scrollTop']();
				self.trigger('scroll', [scrollPos]);
				if (scrollPos == 0) {
					self.trigger('scroll:head', [scrollPos]);
				}
				else if (scrollPos >= self._contentSize - self._containerSize) {
					self.trigger('scroll:end', [scrollPos]);
				}
			});


			//前后按钮点击滚动
			if (!self.arrowEnable) {
				$prev.hide();
				$next.hide();
			}
			else {
				var buttomScrollTimer;
				$prev.mousedown(function(e){
					e.preventDefault();
					self.scrollTo(self.getScrollPosition() - self.arrowDelta, false, self.arrowAnimate);
					buttomScrollTimer = setTimeout(function(){
						if (buttomScrollTimer) clearInterval(buttomScrollTimer);
						buttomScrollTimer = setInterval(function(){
							self.scrollTo(self.getScrollPosition() - self.arrowDelta, false, self.arrowAnimate);
						}, 30);
					}, 500);
				}).mouseleave(function(){
					if (buttomScrollTimer) clearInterval(buttomScrollTimer);
				}).mouseup(function(){
					if (buttomScrollTimer) clearInterval(buttomScrollTimer);
				}).click(function(e){
					e.preventDefault();
				});
				$next.mousedown(function(e){
					e.preventDefault();
					self.scrollTo(self.getScrollPosition() + self.arrowDelta, false, self.arrowAnimate);
					buttomScrollTimer = setTimeout(function(){
						if (buttomScrollTimer) clearInterval(buttomScrollTimer);
						buttomScrollTimer = setInterval(function(){
							self.scrollTo(self.getScrollPosition() + self.arrowDelta, false, self.arrowAnimate);
						}, 30);
					}, 500);
				}).mouseleave(function(){
					if (buttomScrollTimer) clearInterval(buttomScrollTimer);
				}).mouseup(function(){
					if (buttomScrollTimer) clearInterval(buttomScrollTimer);
				}).click(function(e){
					e.preventDefault();
				});
			}

			//鼠标滚轮navigator.userAgent.indexOf('Firefox') != -1
			if (self.mouseWheelEnable && $.browser.mozilla) {
				$container[0].addEventListener('DOMMouseScroll', function(e){
					e.preventDefault();
					var delta = e.detail > 0 ? self.mouseWheelDelta : -self.mouseWheelDelta;
					self.scrollTo(self.getScrollPosition() + delta, false, self.mouseWheelAnimate);
				}, false);
			}
			else if (self.mouseWheelEnable) {
				$container[0].onmousewheel = function(e){
					e = e || window.event;
					var delta = e.wheelDelta > 0 ? -self.mouseWheelDelta : self.mouseWheelDelta;
					self.scrollTo(self.getScrollPosition() + delta, false, self.mouseWheelAnimate);
					e.returnValue = false;
					return false;
				}
			}

			//点击轨道滚动
			if (self.trackEnable) {
				$dragger.mousedown(function(e){
					e.stopPropagation();
				});
				$track.mousedown(function(e){
					e.preventDefault();
					self.scrollTo(e[self.horizontalScroll ? 'pageX' : 'pageY'] - $track.offset()[self.horizontalScroll ? 'left' : 'top'] - self._draggerSize / 2, true, self.trackAnimate);
				});
			}

			//按键滚动
			if (self.keyPressEnable) {
				$container.css('outline', 'none').attr('tabindex', '-1').keydown(function(e){
					var keycode = e.keyCode;
					var scrollVal = self.getScrollPosition();
					//修复内容区域含有textarea input bug
					if (~ "INPUT,TEXTAREA".indexOf(e.target.nodeName.toUpperCase())) {
						return;
					}
					if (!~ "38,39,36,40,37,35".indexOf(keycode)) {
						return;
					}
					if ([38, 39, 36].indexOf(keycode) != -1 && scrollVal != 0) {
						e.preventDefault();
					}
					else if ([40, 37, 35].indexOf(keycode) != -1 && scrollVal != self._contentSize - self._containerSize) {
						e.preventDefault();
					}
					switch (keycode) {
						case 37://right
						case 38://up
							self.scrollTo(scrollVal - self.keyPressDelta, false, self.keyPressAnimate);
							break;
						case 39://left
						case 40://down
							self.scrollTo(scrollVal + self.keyPressDelta, false, self.keyPressAnimate);
							break;
						case 36://home
							self.scrollTo(0, false, self.keyPressAnimate);
							break;
						case 35://end
							self.scrollTo(self._contentSize - self._containerSize, false, self.keyPressAnimate);
							break;
					}
				});
			}

			self.container = $container;
			self.barContainerNode = $barContainer;
			self.trackNode = $track;
			self.arrowPrevNode = $prev;
			self.arrowNextNode = $next;
			self.draggerNode = $dragger;

			self._contentSize = 0;
			self._containerSize = 0;
			self._trackSize = 0;
			self._draggerSize = 0;

			self.update();
		},
		getScrollPosition: function(){
			return this.container[0][this.horizontalScroll ? 'scrollLeft' : 'scrollTop'];
		},
		scrollTo: function(d, isBarPos, animate){
			var self = this;
			var isHorizontal = self.horizontalScroll;
			var draggerPos = isBarPos ? d : d * (self._trackSize - self._draggerSize) / (self._contentSize - self._containerSize);
			var scrollPos = !isBarPos ? d : (d * self._contentSize - d * self._containerSize) / (self._trackSize - self._draggerSize);
			draggerPos = Math.min(self._trackSize - self._draggerSize, Math.max(0, draggerPos));

			// 限定最大横向滚动范围
			if (isHorizontal) {
				scrollPos = Math.min(scrollPos, self.horizontalMaxSize - self._containerSize);
			}

			if (animate === true || (animate && animate.enable !== false)) {
				var prop1 = {};
				var prop2 = {};
				prop1[isHorizontal ? 'scrollLeft' : 'scrollTop'] = scrollPos ? scrollPos : 0;
				prop2[isHorizontal ? 'left' : 'top'] = draggerPos;
				if (animate === true) {
					animate = {
						duration: self.duration,
						easing: self.easing
					}
				}
				self.container.stop().animate(prop1, animate);
				self.draggerNode.stop().animate(prop2, animate);
			}
			else {
				self.container[isHorizontal ? 'scrollLeft' : 'scrollTop'](scrollPos ? scrollPos : 0);
				self.draggerNode.css(isHorizontal ? 'left' : 'top', draggerPos);
			}

		},
		scrollToElement: function(el, op){
			el = $(el);
			op = op || {};
			var animate = op.animate != undefined ? op.animate : this.animate;
			var isHorizontal = this.horizontalScroll;
			if (el.length) {
				var pos = this.container[isHorizontal ? 'scrollLeft' : 'scrollTop']() + el.offset()[isHorizontal ? 'left' : 'top'] - this.container.offset()[isHorizontal ? 'left' : 'top'];
				this.scrollTo(pos, false, animate);
			}
		},
		update: function(){
			this.show();

			var isHorizontal = this.horizontalScroll;

			this._trackSize = this.trackNode[isHorizontal ? 'innerWidth' : 'innerHeight']();
			this._containerSize = this.container[isHorizontal ? 'innerWidth' : 'innerHeight']();
			this._contentSize = this.container[0][isHorizontal ? 'scrollWidth' : 'scrollHeight'];
			this._draggerSize = this.draggerNode[isHorizontal ? 'innerWidth' : 'innerHeight']();

			// 限定最大横向滚动范围
			isHorizontal && (this._contentSize = Math.min(this._contentSize, this.horizontalMaxSize));

			if (this._contentSize > this._containerSize) {
				if (this.draggerAutoLength) {
					this._draggerSize = Math.floor(this._containerSize * this._trackSize / this._contentSize);
					if (this.draggerMinLength) {
						this._draggerSize = Math.max(this._draggerSize, this.draggerMinLength);
					}
					if (this.draggerMaxLength) {
						this._draggerSize = Math.min(this._draggerSize, this.draggerMaxLength);
					}
					this.draggerNode.css(isHorizontal ? 'width' : 'height', this._draggerSize);
				}
				this.scrollTo(this.getScrollPosition(), false, self.animate);
			}
			else if (this.autoHide) {
				this.hide();
			}
		},
		show: function(){
			this.barContainerNode.show();
			this.trigger('show');
		},
		hide: function(){
			this.barContainerNode.hide();
			this.trigger('hide');
		}
	});
	return Klass;
});

define('tui/suggest', [
  "tui/widget",
  "tui/util",
  "tui/art",
  "module/login/login"
], function(Widget, util, Art, Login) {
	var Klass = Widget.extend({
		initialize: function(input, options) {
			if(typeof input == 'string') {
				input = $(input);
			}
			options = options || {};
			var cb = options.callback;
			var time = options.time || 200;
			var self = this;
			Klass.superClass.initialize.apply(this, arguments);
			self.input = input = $(input);
			self.form = input.closest('form');

			if(cb) {
				self.form.bind('submit', function(e) {
					cb.call(self, e);
				});
			}

			self.box = $('<div class="g_searchhint g_searchhint_ex"><iframe frameborder="0" class="gst" src="about:blank"></iframe><div class="g_searchhint_c fix"></div></div>');
			self.boxc = self.box.find('.g_searchhint_c');
			
			self.box.delegate('.g_searchhint a', 'click', function(e) {
				var inputVal = input.val(); //输入框原始值；
				var that = $(this);
				var pack = that.closest('.g_search_pack');
				var type;
				
				//详细面板
				if(pack.length){
					input.val(pack.find('h4 a').html());
					type =  1;
				}else{					
					e.preventDefault();
					type = 0;									
					input.val(that.find('span').text());
				}
								
				self.trigger('choose', [input.val(), input, $(this), inputVal, type]);
			}).delegate('.g_search_l a', 'mouseover', function(e) {
				var that = $(this);
				self.box.find('.current').removeClass('current');
				that.addClass('current');
				self.expand(that.attr('ex'), that.attr('ord'));
			});

			var last = '', timeout, hideTimer;
			input.bind('focus', function() {
				if(last.trim() != '') {
					self.box.show();
				}
				if(timeout) {
					clearTimeout(timeout);
				}
				
				timeout = setTimeout(function() {
					self.trigger('focus', [last, input.val()]);
				}, time);
				
				clearTimeout(hideTimer);
			}).bind('blur', function() {
				if(hideTimer) {
					clearTimeout(hideTimer);
				}
				hideTimer = setTimeout(function() {
					self.box.hide();
					self.box.find('.current').removeClass('current');
				}, 200);
			}).bind('keyup cut paste', function(e) {
				if(last != input.val()) {
					if(timeout) {
						clearTimeout(timeout);
					}
					if(e.type == 'keyup' && [13, 27, 38, 39, 40].indexOf(e.keyCode) > -1) {
						return;
					}
					timeout = setTimeout(function() {
						last = input.val();
						if(last.trim() == '') {
							self.clear();
						}
						else {
							self.trigger('input', [last]);
						}
					}, time);
				}
			}).bind('keydown', function(e) {
				if(e.keyCode == 13 || e.keyCode == 27) {
					self.box.hide();
				}
				else if(e.keyCode == 38) {
					self.prev();
				}
				else if(e.keyCode == 39) {
					self.box.find('a.current').click();
				}
				else if(e.keyCode == 40) {
					self.next();
				}
			});
		},
		clear: function() {
			this.boxc.html('');
			this.box.hide();
			return this;
		},	
		expand: function(ex, ord){
			var self = this;
			if(ex === undefined){
				return;
			}
			
			self.exItem.hide();
			self.exItem.forEach(function(pack){
				var $pack = $(pack);
				if($pack.attr('ord') == ord){
					$pack.show();
					
					self.trigger('expand', [ex, ord, $pack]);
				}
			});

		},		
		hightLine: function(q, word){
			word = util.substr(word, 26);
			var len = q? q.length : 0;
			var w = word.substring(0, len);

			return {
				w: len === 0? word: w,
				q: len !=0 ? word.substring(len) : ''
			}
			
		},
		add: function(data) {
			var self = this;
			var lis = ['<ul class="g_search_l">'];
			var panle = ['<div class="g_search_p">'];
			var q = data.q || '';
			var dataU = [];
			var render;
			
			Art.helper('split', util.split);
			data.r.forEach(function(item, i){
				if(!item.c){ return;}
				
				item.mo = '';//详细标识；
				item.u = item.u ? item.u[0] : 0;//详细；
				item.b = item.b || '';
								
				//详细；
				if(item.u){
					//土豆Kubox这边的逻辑是优先展示博客信息
					item.u.ord = i;
					item.u.e = item.u.e || 1;
					dataU.push(item.u);
					
					!item.z && (item.mo = '<i class="mo iconfont">&#xe603;</i>');
				}
				
				item.i = i;
				item.k = self.hightLine(q, item.c);
				
				//autolist
				render = Art.compile('<li><a href="###" pos="1" wordtype="<%=item.b%>" ord="<%=item.i%>" ex="<%=item.mo? 1: 0%>" ><span><%=item.k.w%><%if(item.k.q){%><b><%=item.k.q%></b><%}%></span><%==item.mo%></a></li>');
				lis.push(render({item: item}));
				
			});
			lis.push('</ul>');
			
			var tpl = require.text('tui/suggest.tpl');
			var html = Art.compile(tpl)({data : dataU, logined: Login.uid()});
			
			self.boxc.html( lis.join('') + html);
			self.box.show();
			
			self.exItem = self.box.find('.g_search_pack');
			
			if(dataU[0] && dataU[0].ord == 0){
				self.trigger('expand', [1, 0, self.exItem.eq(0)]);
			}
			
			return this;
		},
		msg: function(s) {
			this.boxc.html(s);
			this.box.show();
			return this;
		},
		prev: function() {
			var current = this.box.find('.current');
			if(current[0]) {
				current.removeClass('current');
				current = current.closest('li').prev().find('a');
			}
			if(!current[0]) {
				current = this.box.find('.g_search_l a:last');
			}
			
			this.expand(current.attr('ex'), current.attr('ord'));
			current.addClass('current');
			this.input.val(current.find('span').text());
			this.box.show();
			
			return this;
		},
		next: function() {
			var current = this.box.find('.current');
			if(current[0]) {
				current.removeClass('current');
				current = current.closest('li').next().find('a');
			}
			if(!current[0]) {
				current = this.box.find('.g_search_l a:first');
			}
			this.expand(current.attr('ex'), current.attr('ord'));
			current.addClass('current');
			this.input.val(current.find('span').text());
			this.box.show();
			return this;
		},
		current: function() {
			var current = this.box.find('.current');
			if(current[0]) {
				return current;
			}
			else {
				return null;
			}
		},
		node: function() {
			return this.box;
		},
		render: function() {
			this.form.after(this.box);
			return this;
		}
	});
	return Klass;
});

define('tui/page', ['./widget', './template'], function(Widget, template) {
	var tpl = require.text('tui/page.tpl');
	var Klass = Widget.extend({
			initialize: function(options) {
				if(!options.template) {
					options.template = tpl;
				}
				options.total = options.total || 1;
				options.current = options.current || 1;
				options.radio = options.radio || 3;
				options.onchange = options.onchange || function(){};
				var self = this;
				self.options = options;
				Klass.superClass.initialize.apply(self, arguments);
				self.targetNode.delegate('a', 'click', function(e) {
					if(!options.noPreventDefault) {
						e.preventDefault();
					}
					var o = $(this);
					if (o.hasClass('prev')) 
						self.prev(options.onchange);
					else if (o.hasClass('next')) 
						self.next(options.onchange);
					else {
						var rel = parseInt($.trim(o.attr('rel')));
						if(/\d+/.test(rel)){
							self.go(parseInt(rel), options.onchange);
						}
					}
				});
				return this;
			},
			remove: function(){
				this.targetNode.undelegate();
				this.targetNode.remove();
				this.targetNode = null;
				this.unbind();
			},
			reset: function(options) {
				if(options) {
					$.extend(this.options, options);
				}
				this.targetNode.html(template.convertTpl(this.options.template, this.options));
			},
			total: function(i) {
				if(i !== undefined) {
					this.options.total = i;
				}
				return this.options.total;
			},
			current: function(i) {
				if(i !== undefined) {
					this.options.current = i;
				}
				return this.options.current;
			},
			radio: function(i) {
				if(i !== undefined) {
					this.options.radio = i;
				}
				return this.options.radio;
			},
			go: function(i, cb) {
				this.current(i);
				this.reset();
				if(cb) {
					cb(this.options.current);
				}
				this.trigger('toggle', [i]);
				return this;
			},
			prev: function(cb) {
				if(this.options.current > 1) {
                    this.go(this.options.current - 1, cb);
				}
				return this;
			},
			next: function(cb) {
				if(this.options.current < this.options.total) {
                    this.go(this.options.current + 1, cb);
				}
				return this;
			},
			first: function() {
				if(this.options.current > 1) {
                    this.go(1);
				}
				return this;
			},
			last: function() {
                if (this.options.current < this.options.total) {
                    this.go(this.options.total);
                }
				return this;
			}
		});
	return Klass;
});

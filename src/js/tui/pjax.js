define('tui/pjax', ['tui/event', 'tui/hashchange'], function(Event, Hashchange) {

	// Is pjax supported by this browser?
	var supportPjax = window.history && window.history.pushState && window.history.replaceState
	// pushState isn't reliable on iOS yet.
	&& ! navigator.userAgent.match(/(iPod|iPhone|iPad|WebApps\/.+CFNetwork)/);

	// Used to detect initial (useless) popstate.
	// If history.state exists, assume browser isn't going to fire initial popstate.
	var popped = 'state' in window.history; //XXX
	var initialURL = location.href;

	var refer = document.referrer;
	var E_CLICK = 'click';

	var hc = new Hashchange('http://ui.tudou.com/js/embed/xstorage/index.html');
	var K = Event.extend({
		initialize: function(data, options) {
			var self = this;
			K.superClass.initialize.call(self);
			this.active = false;
			this.options = options;
			if (supportPjax) {
				window.addEventListener('popstate', function(event) {
					var initialPop = ! popped && location.href == initialURL;
					popped = true;
					if (initialPop) return;

					var state = event.state;
					if(!state) return;
					
					var url = location.href;
					var refer = state.refer || '';
					var title = state.title || '';
					document.title = title;
					if (data) {
						self.fire('change', [url, refer]);
					} else {
						window.location = location.href;
					}
				});
			} else {
				hc.bind('hashChange', function(hash) {
					var url = hash ? hash.replace('#', '') : location.href;
					location.hash = url;//需要手动改写hash
					self.fire('change', [url, url]); //TODO fix refer
				});
			}
		},
		click: function(el, closest) {
			var self = this;
			$(el).click(function(e) {
				var $e = $(e.target);
				// 按Ctrl + 点击  || 点击加点播单按钮
				if (e.which > 1 || e.metaKey || $e.is('.quick_hook')) return true;
				var tar = closest ? $e.closest(closest) : $e;
				var url = tar.data('pjax');
				self.fire(E_CLICK);
				//self.option.afterClick();
				if (!url) return true;
				self.push(url, '');
				e.preventDefault();
			});
		},
		push: function(url, title) {
			var oldTitle = document.title;
			document.title = title;
			var refer = location.href;
			if (supportPjax) {
				if (!this.active) {
					history.replaceState({}, oldTitle, null);
					this.active = true;
				}
				history.pushState({
					refer: refer,
					title: title
				},
				title, url);
				this.fire('change', [url, refer]);
			}
			else {
				location.hash = url;
				hc.add(url);
			}
		},
		getRefer: function() {
			return refer;
		}
	});
	return K;
});


(function(){

	var eventSplitter = /\s+/;

	function Events(){}

	Events.prototype.on = function(events, callback, context){
		var cache, event, list;
		if (!callback) return this;

		cache = this.__events || (this.__events = {});
		events = events.split(eventSplitter);

		while (event = events.shift()) {
			list = cache[event] || (cache[event] = []);
			list.push(callback, context);
		}

		return this;
	};

	Events.prototype.one = function(events, callback, context){
		var self = this;
		var event, callFn;
		if (!callback) return this;

		events = events.split(eventSplitter);

		while (event = events.shift()) {
			(function(event){
				callFn = function(){
					Events.prototype.off.apply(self, [event]);
					callback.apply(context || this, arguments);
				};
				Events.prototype.on.apply(self, [event, callFn, context]);
			})(event);
		}

		return this;
	};

	Events.prototype.off = function(events, callback, context){
		var cache, event, list, i;

		// No events, or removing *all* events.
		if (!(cache = this.__events)) return this;
		if (!(events || callback || context)) {
			delete this.__events;
			return this;
		}

		events = events ? events.split(eventSplitter) : Object.keys(cache);

		// Loop through the callback list, splicing where appropriate.
		while (event = events.shift()) {
			list = cache[event];
			if (!list) continue;

			if (!(callback || context)) {
				delete cache[event];
				continue;
			}

			for (i = list.length - 2; i >= 0; i -= 2) {
				if (!(callback && list[i] !== callback || context && list[i + 1] !== context)) {
					list.splice(i, 2);
				}
			}
		}

		return this;
	};

	Events.prototype.trigger = function(events){
		var cache, event, all, list, i, len, rest, args;
		if (!(cache = this.__events)) return this;

		events = events.split(eventSplitter);

		rest = arguments[1] || [];

		// For each event, walk through the list of callbacks twice, first to
		// trigger the event, then to trigger any `"all"` callbacks.
		while (event = events.shift()) {
			// Copy callback lists to prevent modification.
			if (all = cache.all) all = all.slice();
			if (list = cache[event]) list = list.slice();

			// Execute event callbacks.
			if (list) {
				for (i = 0, len = list.length; i < len; i += 2) {
					list[i].apply(list[i + 1] || this, rest);
				}
			}

			// Execute "all" callbacks.
			if (all) {
				args = [event].concat(rest);
				for (i = 0, len = all.length; i < len; i += 2) {
					all[i].apply(all[i + 1] || this, args);
				}
			}
		}

		return this;
	};
	Events.prototype.triggerHandler = Events.prototype.trigger;

	Events.prototype.bind = Events.prototype.on;
	Events.prototype.unbind = Events.prototype.off;

	// Custom Events
	Zepto.Events = Events;

	Zepto.isNumeric = Zepto.isNumeric || function(obj){
		return !isNaN(parseFloat(obj)) && isFinite(obj);
	};

	Zepto.merge = Zepto.merge || function(first, second){
		var i = first.length,
			j = 0;
		if (typeof second.length === "number") {
			for (var l = second.length; j < l; j++) {
				first[ i++ ] = second[ j ];
			}
		} else {
			while (second[j] !== undefined) {
				first[ i++ ] = second[ j++ ];
			}
		}
		first.length = i;
		return first;
	};

	Zepto.makeArray = Zepto.makeArray || function( array, results ){
		var ret = results || [];
		if ( array != null ) {
			// The window, strings (and functions) also have 'length'
			// Tweaked logic slightly to handle Blackberry 4.7 RegExp issues #6930
			var type = Zepto.type( array );

			if ( array.length == null || type === "string" || type === "function" || type === "regexp" || Zepto.isWindow( array ) ) {
				Array.prototype.push.call( ret, array );
			} else {
				Zepto.merge( ret, array );
			}
		}

		return ret;
	};

	Zepto.each(["Width", "Height"], function(i, name){
		var type = name.toLowerCase();

		// innerHeight and innerWidth
		Zepto.fn["inner" + name] = function() {
			var elem = this[0];
			return elem ?
				elem.style ?
				parseFloat( this.css( elem, type, "padding" ) ) :
				this[ type ]() :
				null;
		};

		// outerHeight and outerWidth
		Zepto.fn["outer" + name] = function(margin) {
			var elem = this[0];
			return elem ?
				elem.style ?
				parseFloat( this.css( elem, type, margin ? "margin" : "border" ) ) :
				this[ type ]() :
				null;
		};
	});

	// Fix native bind (iOS 3/4)
	Function.prototype.bind || (Function.prototype.bind = function(oThis) {
		var fSlice = Array.prototype.slice,
			aArgs = fSlice.call(arguments, 1),
			fToBind = this,
			fNOP = function () {},
			fBound = function () {
				return fToBind.apply(this instanceof fNOP
									 ? this
									 : oThis || window,
									 aArgs.concat(fSlice.call(arguments)));
			};

		fNOP.prototype = this.prototype;
		fBound.prototype = new fNOP();
		return fBound;
	});

})();

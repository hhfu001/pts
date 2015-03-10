
define('tui/easing2', [], function(require, exports){

	// jQuery Easing v1.3 - http://gsgd.co.uk/sandbox/jquery/easing/
	jQuery.easing['jswing'] = jQuery.easing['swing'];
	
	jQuery.extend(jQuery.easing, {
		// t: current time, b: begInnIng value, c: change In value, d: duration
		easeOutCubic: function(x, t, b, c, d){
			t /= d;
			t--;
			return c * (t * t * t + 1) + b;
		},
		easeOutQuart: function(x, t, b, c, d){
			t /= d;
			t--;
			return -c * (t * t * t * t - 1) + b;
		},
		easeOutQuint: function(x, t, b, c, d){
			t /= d;
			t--;
			return c * (t * t * t * t * t + 1) + b;
		},
		easeOutCirc: function(x, t, b, c, d){
			t /= d;
			t--;
			return c * Math.sqrt(1 - t * t) + b;
		},
		easeOutSine: function(x, t, b, c, d){
			return c * Math.sin(t / d * (Math.PI / 2)) + b;
		},
		easeOutExpo: function(x, t, b, c, d){
			return c * (-Math.pow(2, -10 * t / d) + 1) + b;
		},
		mcsEaseOut: function(x, t, b, c, d){
			var ts = (t /= d) * t, tc = ts * t;
			return b + c * (0.499999999999997 * tc * ts + -2.5 * ts * ts + 5.5 * tc + -6.5 * ts + 4 * t);
		},
		draggerRailEase: function(x, t, b, c, d){
			t /= d / 2;
			if (t < 1) 				
				return c / 2 * t * t * t + b;
			t -= 2;
			return c / 2 * (t * t * t + 2) + b;
		}
	});
});

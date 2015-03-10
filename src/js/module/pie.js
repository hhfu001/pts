define([], function(require, exports) {

	function css3Pie() {
		var elm = document.body || document.createElement('div');
		var domPrefixes = ['webkit', 'Moz', 'ms', 'O', ''];
		var prefix;
		domPrefixes.forEach(function(_prefix) {
			if ('undefined' !== typeof elm.style[_prefix + 'Animation']) {
				prefix = _prefix ? '-' + _prefix.toLowerCase() + '-' : '';
			}
		});

		$('.progress-pie').each(function(index, el) {
			var me = $(this);
			var num = (me.find('.percent').text() || '0');
			
			num = num > 100 ? 100 : num;

			if(prefix){
				num = num * 3.6;

				if (num <= 180) {
					me.find('.right').css(prefix + 'transform', "rotate(" + num + "deg)");
				} else {
					me.find('.right').css(prefix + 'transform', "rotate(180deg)");
					me.find('.left').css(prefix + 'transform', "rotate(" + (num - 180) + "deg)");
				};

			}else{
				me.css({'background': 'none'}).html('<div class="pie pie_'+ num.slice(0, num == 100 ? 2: 1) +'">'+ num +'%</div>');

			}

		});

	}



	exports.init = function() {

		css3Pie();

	};

});
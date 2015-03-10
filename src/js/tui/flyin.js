define('tui/flyin', function() {
	return function(options, callback){
		var $source = $(options.source);
		var $target = $(options.target);
		var pos = options.pos || {left: 0, top: 0};
		var duration = options.duration || 300;
		var easing = options.easing || 'linear';
		
		if (options.target) {
			pos = $target.offset();
		}

		var $clone = $source.clone();
		$(document.body).append($clone);
		if (options.className) {
			$clone.addClass(options.className);
		}
		
		var css = $source.offset();
		css.position = 'absolute';
		css.width = $source.width();
		css.height = $source.height();
		css.zIndex = 9999;
		$clone.css(css);
		
		//$('#gTop').before($target[0].className);
        var aniParam = {
            opacity: options.opacity || 1,
            left: pos.left,
            top: pos.top
        }
		if (options.opacity !== undefined) {
			aniParam.opacity = options.opacity === true ? 0 : options.opacity;
		}
		if (options.width !== undefined) {
			aniParam.width = options.width === true ? $target.width() : options.width;
		}
		if (options.height !== undefined) {
			aniParam.height = options.height === true ? $target.height() : options.height;
		}
        $clone.animate(aniParam, duration, easing, function(){
            $clone.remove();
            callback && callback();
        });
	}
})

/*
 * 基于TUI.scrollLoader 图片分段延后加载
 * 默认对加classname为lazyImg的img标签进行延后替换处理
 */
define('tui/lazyImageLoader', [
	'tui/scrollLoader'
], function(scrollLoader){
	var imgs, size, attr, zone = {};

	function loadImage(op){
		op = op || {};

		size = op.size || 300;				// 图片分块区域大小
		attr = op.attr || 'alt';			// x
		imgs = op.imgs || $('img.lazyImg');	// 需要延后到图片对象

		/*for (var i = 0, l = imgs.length; i < l; i++) {
		 var img = imgs[i];
		 var top = $(img).offset().top>0 ? $(img).offset().top : 0 || $(img).parents(':visible').offset().top || 0;
		 // 图片按实际位置分段
		 addToZone(top, img);
		 }*/
		var optZone = [];
		imgs.each(function(){
			var $el = $(this),
				offset = $el.offset(),
				top = offset.top > 0 ? offset.top : ($el.parents(':visible') && $el.parents(':visible').offset()) ? $el.parents(':visible').offset().top : 0;
			addToZone(top, this, optZone);
		});
		for (var z in optZone) {
			if (optZone.hasOwnProperty(z)) {
				var images = $(optZone[z]);
				images.each(function(){
					var node = this;
					scrollLoader.y(z).threshold(size).load(function(){
						var _img = $(node);
						_img.attr('src', _img.attr(attr));
						_img.removeAttr(attr);
						if (_img[0].className.indexOf('lazyImg') !== -1) {
							_img.removeClass('lazyImg');
						}
					})

				});
			}
		}
	}

	function addToZone(top, img, optZone){
		top = top - top % size;
		//zone[top] = zone[top] || [];
		//zone[top].push(img);
		optZone[top] = optZone[top] || [];
		optZone[top].push(img);
	}

	return loadImage;
});

define(function() {
	return {
		node: function(node, width, height) {
			var clone = node.clone();
			if(!width) {
				width = node.width();
			}
			if(!height) {
				height = node.height();
			}
			clone.css({
				position: 'absolute',
				left: 0,
				top: 0,
				width: width,
				height: 'auto',
				visibility: 'hidden'
			});
			node.after(clone);
			var str = clone.html();
			if(clone.height() <= height || str.length < 2) {
				return;
			}
			var start = 0, end = str.length;
			while(true) {
				if(end - start < 2) {
					clone.remove();
					return str.slice(0, start) + '..';
				}
				var index = Math.floor((end - start) >> 1) + start;
				clone.html(str.substr(0, index) + '..');
				if(clone.height() > height) {
					end = index;
				}
				else {
					start = index;
				}
			}
		}
	};
});
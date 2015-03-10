
define('tui/fixed', ['tui/browser'], function(Browser) {

	var Fixed = function(elm, op) {
        elm = $(elm)[0];
		var obj, handler, onScroll,
			doc = document.documentElement,
			win = $(window),
			ie6 = Browser.ie6;
		// @private 针对特定浏览器或需求，生成更精简的滚轴事件回调函数
		var changeScroll = function(){
			var fn, getTop = function(){
				return ( obj.bottom > -1000 )
					? ( win.height() - obj.height - obj.bottom + win.scrollTop() )
					: ( ( obj.top || 0 ) + win.scrollTop() );
			};
			if(ie6) {
				elm.style.position = "absolute";
				fn = op ? (function(){ //有边界
					var t = getTop(), e = obj.elm;
					if( op.top > -1000 && t < op.top )
						t = op.top;
					else if( op.bottom > -1000 && t > doc.offsetHeight - op.bottom )
						t = doc.offsetHeight - op.bottom;
					e.style.top = t + "px";
				}) : (function(){
					obj.elm.style.top = getTop() + "px";
				});
			} else if(op) { //有边界
				fn = function(){
					var t = getTop(), e = obj.elm;
					if( op.top > -1000 && t < op.top ) {
						e.style.position = "absolute";
						e.style.top = op.top + "px";
					} else if( op.bottom > -1000 && t > doc.offsetHeight - op.bottom ) {
						e.style.position = "absolute";
						e.style.top = doc.offsetHeight - op.bottom + "px";
					} else if( parseInt(e.style.top) > -1000 ) { //脱离边界后恢复fixed状态
						e.style.position = "fixed";
						e.style.top = "";
					}
				};
			}
			return fn;
		};
		if( ie6 || op ) { //只在ie6或有边界的情况下才需要绑定滚轴事件
			obj = { //针对当前元素的状态对象，供外部修改
				elm: elm,
				top: parseInt( $(elm).css("top") ),
				bottom: parseInt( $(elm).css("bottom") ),
				limit: op,
				disabled: false
			};
			if(obj.bottom > -1000)
				obj.height = elm.offsetHeight;
			handler = changeScroll(); //生成更精简的回调函数
			onScroll = function(){
				if(obj.disabled)return;
				handler(obj);
			};
			handler(obj);
			$(window).bind('scroll', onScroll);
			return obj;
		}
		return false;
	};

	return Fixed;

});

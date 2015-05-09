define(['tui/art', './login'], function(Art, Login, require, exports) {
	

	function g_dropdown_toggle() {
		$('#header').on('mouseenter', '.icon-weixin', function() {
			$(this).find('.qrcode').css({display: 'inline-block'});
		}).on('mouseleave', '.share', function() {
			$(this).find('.qrcode').css({display: 'none'});
		});
	}
	
	// 跟随导航;
	function fixnav (op){
		op = $.extend({
			// force: false, //强制fixed 默认根据body高度来定
			top: 165, //距离顶部fixed 
			disabled: true //禁用fixed（默认关闭伴随）
		}, op);

		var $win = $(window);
		var winH = $win.height();
		var $nav = $('#header .m-nav');
		var barStatus = 0;
		var top = op.top;

		if(op.disabled){
			return;
		}

		var isTop = $win.scrollTop() <= top;

		if(!isTop){
			$nav.addClass('fixed');
			barStatus = 1;
		}

		$win.bind('scroll', function(){

			isTop = $win.scrollTop() <= top;
			if(!isTop && barStatus === 0){
				$nav.addClass('fixed');
				barStatus = 1;
			}
			if(isTop && barStatus === 1){
				$nav.removeClass('fixed');
				barStatus = 0;
			}
		});
	};




	exports.init = function(op) {
		// Login.autoLogin();

		fixnav(op);
		g_dropdown_toggle();

		$('#gUser').on('click', '[data-role=login]', function(e){
			e.preventDefault();
			Login.needLogin(function(){
				location.reload();
			});
		});

	};


});
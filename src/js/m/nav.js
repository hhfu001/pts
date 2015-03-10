define(['tui/art', './login'], function(Art, Login, require, exports) {
	
	Login.autoLogin();

	function g_dropdown_toggle() {
		$('.mini-nav').on('mouseenter', '.btn-qrcode', function() {
			$(this).find('.qrcode').css({height: 'auto'});
		}).on('mouseleave', '.sns', function() {
			$(this).find('.qrcode').css({height: '0'});
		});
	}

// function g_dropdown_toggle() {
// 		$('#gUser').on('mouseenter','.info', function() {
// 			$(this).addClass('active');
// 			$(this).find('.user-info').css({top: '60px'});
// 		}).on('mouseleave', '.info', function() {
// 			$(this).removeClass('active');
// 			$(this).find('.user-info').css({top: '-250px'});
// 		});
// 	}

	function login(){

		$('#gUser').on('click','#gLogin, #gReg', function(e){
			e.preventDefault();

			var id = $(this).attr('id');

			Login.needLogin({reg: id == 'gReg'});

		}).on('click', '.jsLogout', function(e){
			e.preventDefault();
			Login.exit();

		});

	}

	exports.init = function() {
		login();

		g_dropdown_toggle();

	};


});
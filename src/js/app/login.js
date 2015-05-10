define([
	'tui/event',
	'tui/art',
	'tui/dialog',
	'tui/html5form',
], function( Event, Art, Dialog, Html5form, require, exports){
	
	var Login = new Event();
	var codeSucc;
	var loginArt = Art.compile(require.text('./login.tpl'));

	function noop(){}

	Login.needLogin = function(node, callback) {
		if(typeof node === 'function'){
			callback = node;
			node = null;
		}else{
			node = node || null;
		}

		if(node){
			var $content = $(node);
		}else{
			var code = $('#gCodeID').val();
			var dlg = new Dialog({
				className : 'login_dialog',
				content : loginArt({code: code, domain: bootDomain, t : Math.random()})
			});

			var $content = dlg.dom.content;	
		}


		var $form = $content.find('form');
		var $tel = $form.find('[name=name]');
		var $pwd = $form.find('[name=pwd]');
		var $code = $form.find('[name=code]');

		var h5form = new Html5form($form, Html5form.VALID_BLUR);
		var params = {};

		$content.on('click', '.submit', function(e){
			e.preventDefault();
			var name = $tel.val().trim();

			if(!name.length){
				h5form.tip($tel, '请填写正确的用户名');
				return;
			}

			var pwd = $pwd.val().trim();
			if(!pwd.length){
				h5form.tip($pwd, '请输入密码');
				return;
			}
			if(!codeSucc){
				h5form.tip($code, '请输入正确的验证码');
				return;
			}

			var params = $form.serialize();

			params += '&act=login';

			$.post(bootDomain + 'login.php', params, function(res){

				if(res == 1){
					callback && callback();
				}else{
					Dialog.alert('用户名或者密码不正确');
					getCode();
				}

			});

		}).on('click', '.code', function(e){
			e.preventDefault();

			getCode();
		});

		function getCode(){

			var code = $form.find('.code');

			code.attr('src', bootDomain + 'get_code.php?load=yes&id=' + code.attr('codeId') + '&' + Math.random());	
		}

		$code.on('input', function(){

			var me =  $(this);
			var val = me.val();
			var code = $form.find('.code');

			if(val.length == 5){

				$.post(bootDomain + 'check.php', { act: 'code', v: val , id: code.attr('codeId') }, function(res) {
					codeSucc = res == 1;

					if(!codeSucc){
						h5form.tip(me, '验证码无效');
						getCode();
						
					}

				}, 'json');

			}

		});

	};



	$('#gLogout').on('click', function(e){
		e.preventDefault();

		$.ajax({
			url: 'login.php?act=logout',
			params: { act: 'logout'},
			success: function(){
				location.reload();
			}
		});

	});

	return Login;

});
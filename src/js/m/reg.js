
define([
	'tui/cookie',
	'tui/art',
	'tui/dialog',
	'tui/html5form',
	'./login'
], function(Cookie, Art, Dialog, Html5form, Login, require, exports){

	var regTpl = require.text('../tpl/reg.tpl');
	var regArt = Art.compile(regTpl);

console.log(Login);

	function reg(op, callback) {
		
		var dlg = new Dialog({
			className : 'login_dialog reg_dialog',
			content : regArt({})
		});

		var $content = dlg.dom.content;
		var $form = $content.find('form');
		var $tel = $form.find('.tel');
		var $pwd = $form.find('.pwd');
		var $ckpwd = $form.find('.ckpwd');
		var $uname = $form.find('.username');

		var h5form = new Html5form($form);

		$content.on('click', '.submit', function(e){
			e.preventDefault();

			if(!/^1[3|5|8|7|4|6]{9}/.test($tel.val().trim())){
				h5form.tip($tel, '请填写正确的手机号码');
				return;
			}

			if(!$pwd.val().trim().length){
				h5form.tip($pwd, '请输入密码');
				return;
			}

			//TODO
			// Login.autoLogin();



			
		}).on('click', '.login', function(e){
			e.preventDefault();
			dlg.close();
			h5form.clearAll();

			Login.needLogin();
		});

	};



	return reg;

});

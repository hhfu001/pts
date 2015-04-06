
define([
	'tui/cookie',
	'tui/event',
	'tui/art',
	'tui/dialog',
	'tui/html5form',
	'tui/countdown',
	'./model'
], function(Cookie, Event, Art, Dialog, Html5form, Countdown, Model, require, exports){
	
	
	var domain = 'jishachengta.com.cn';
	var base_domain = window.base_domain || '';
	var Login = new Event();
	var navTpl = require.text('../tpl/navlogin.tpl');
	var navArt = Art.compile(navTpl);

	var loginTpl = require.text('../tpl/login.tpl');
	var loginArt = Art.compile(loginTpl);

	var regTpl = require.text('../tpl/reg.tpl');
	var regArt = Art.compile(regTpl);

	var cookieSettings = { domain: domain, path: '/'};

	var mobileReg = /^1[3|5|8|7|4|6]\d{9}/;

	// writeCookie({
	// 	u_pic: 'http://u4.tdimg.com/1/121/16/129565489796808384508531606661958242731.jpg',
	// 	u_id: 123,
	// 	u_name: 'test'
	// });
	// console.log('123123123');
	// Cookie('RELEASE_VERSION', '2015_04_99', { domain: domain, path: '/', expires: 100});

	var u_id = Cookie('u_id');
	var u_name = Cookie('u_name');
	var u_pic = Cookie('u_pic');

	Login.isLogin = function(){
		u_id = Cookie('u_id');
		u_name = Cookie('u_name');
		u_pic = Cookie('u_pic');

		return (u_id && u_id != '0');

	};

	function noop(){}

	function writeCookie(op){
		op = op || {};

		u_pic = op.u_pic;
		u_id = op.u_id;
		u_name = op.u_name;

		Cookie('u_id', u_id, cookieSettings);
		Cookie('u_name', u_name, cookieSettings);
		Cookie('u_pic', u_pic, cookieSettings);

	}

	function delCookie(){
		Cookie('u_id', 0, {domain: domain, path: '/', expires : 'Thu, 01 Jan 1970 00:00:01 GMT'});
		Cookie('u_name', 0, {domain: domain, path: '/', expires : 'Thu, 01 Jan 1970 00:00:01 GMT'});
		Cookie('u_pic', 0, {domain: domain, path: '/', expires : 'Thu, 01 Jan 1970 00:00:01 GMT'});
	}

	function render(data, write){
		data.domain = base_domain;

		$('#gUser').html(navArt(data));

		write && writeCookie(data);
	}

	Login.autoLogin = function(op, callback){

		if(Login.isLogin()){
			render({
				u_id: u_id,
				u_name: u_name,
				u_pic: u_pic
			});
		}
	};


	Login.userInfo = function(){

		return Login.isLogin() ? {
			u_id : u_id,
			u_name : u_name,
			u_pic: u_pic
		}: false;
	};


	function toReg(op, callback) {
		
		var dlg = new Dialog({
			className : 'login_dialog reg_dialog',
			content : regArt({domain: base_domain})
		});

		var $content = dlg.dom.content;
		var $form = $content.find('form');
		var $tel = $form.find('.tel');
		var $pwd = $form.find('.pwd');
		var $ckpwd = $form.find('.ckpwd');
		var $uname = $form.find('.username');
		var $code = $form.find('.code');
		var $recmobile = $form.find('.recmobile');

		var h5form = new Html5form($form, Html5form.VALID_BLUR);
		var params = {};
		var phoneEnable;

		$content.on('click', '.submit', function(e){
			e.preventDefault();

			params.mobile =  $tel.val().trim();
			if(!mobileReg.test(params.mobile)){
				h5form.tip($tel, '请填写正确的手机号码');
				return;
			}

			if(!phoneEnable){
				h5form.tip($tel, '该手机号码已注册');
				return;
			}

			params.pwd =  $pwd.val().trim();
			if(!/^\w{6,}$/.test(params.pwd)){
				h5form.tip($pwd, '请输入至少六位数的密码');
				return;
			}

			params.ckpwd =  $ckpwd.val().trim();
			if(params.ckpwd  !== params.pwd ){
				h5form.tip($ckpwd, '两次输入的密码不一致');
				return;
			}

			params.realname =  $uname.val().trim();
			if(!params.realname.length){
				h5form.tip($uname, '请输入真实的姓名');
				return;
			}

			params.code =  $code.val().trim();
			if(!params.code.length){
				h5form.tip($code, '请输入手机验证码');
				return;
			}

			params.recmobile = $recmobile.val().trim();
			if(params.recmobile.length && !mobileReg.test(params.recmobile)){
				h5form.tip($recmobile, '请填写正确的手机号码');
				return;
			}

			params.act = 2;
			Model.postData(params, function(res){

				// render({
				// 	u_id : res.data.userId,
				// 	u_name : res.data.username || res.data.realname,
				// 	u_pic: 'http://u1.tdimg.com/u/U-01.gif'

				// }, true);
				Dialog.alert('注册成功，请重新登录。');

				callback && callback();
				dlg.close();
				h5form.clearAll();

			}, noop, true);

		}).on('click', '.login', function(e){
			e.preventDefault();
			dlg.close();
			h5form.clearAll();

			Login.needLogin();
		}).on('blur', '.ckpwd', function(){
			var val = $(this).val().trim();
			var pwd = $pwd.val().trim();

			if(val && val !== pwd){
				h5form.tip($ckpwd, '两次输入的密码不一致');
			}

		}).on('blur', '.tel', function(e){
			e.preventDefault();
			var me = $(this).val().trim();

			if(!mobileReg.test(me)){
				h5form.tip($tel, '请填写正确的手机号码');
				return;
			}

			if(phoneEnable) return;

			Model.getData({ act: 6, mobile: me },function(res){
				if(res.data == 1){
					h5form.tip($tel, '该手机号码已注册');
					phoneEnable = false;
				}else{
					phoneEnable = true;
				}
			});

		}).on('change', '.tel', function(e){
			phoneEnable = false;
		}).on('click', '.send', function(e){
			e.preventDefault();
			var me = $(this);

			if(!me.hasClass('sending')){
				sendCode(me, $tel, h5form);
			}
		});
	}

	function sendCode(node, ipt, h5form){
		var mobile = ipt.val().trim();

		if(!mobileReg.test(mobile)){
			h5form.tip(ipt, '请填写正确的手机号码');
			return;
		}
		
		node.html('<i>60</i>秒后可重新获取').addClass('sending');

		var $i = node.find('i');

		Countdown($i, 60, function(){
			node.html('获取手机验证码').removeClass('sending');
		});

		Model.getData({act: 5, mobile: mobile }, function(res){
			if(res.data){
				console.log(res.msg);
			}
		});
	}

	Login.needLogin = function(op, callback) {
		if(typeof op === 'function'){
			callback = op;
			op = {};
		}else{
			op = op || {};
		}

		if(Login.isLogin()){
			callback && callback();
			return;
		}

		if(op.reg){
			toReg(op, callback);
			return;
		}

		var dlg = new Dialog({
			className : 'login_dialog',
			content : loginArt({url: base_domain+ '/findpass/step1'})
		});

		var $content = dlg.dom.content;
		var $form = $content.find('form');
		var $tel = $form.find('.tel');
		var $pwd = $form.find('.pwd');

		var h5form = new Html5form($form, Html5form.VALID_BLUR);
		var params = {};

		$content.on('click', '.submit', function(e){
			e.preventDefault();
			params.username = $tel.val().trim();

			if(!mobileReg.test(params.username)){
				h5form.tip($tel, '请填写正确的手机号码');
				return;
			}

			params.password = $pwd.val().trim();
			if(!params.password.length){
				h5form.tip($pwd, '请输入密码');
				return;
			}

			params.act = 3;
			Model.postData(params, function(res){
				render({
					u_id : res.data.userId,
					u_name : res.data.username || res.data.realname,
					u_pic: 'http://u1.tdimg.com/u/U-01.gif'
				}, true);

				callback && callback();

				dlg.close();
				h5form.clearAll();
			}, noop, true);

		}).on('click', '.goreg', function(e){
			e.preventDefault();
			dlg.close();
			h5form.clearAll();

			toReg(op, callback);
		});
	};


	Login.exit = function(cb){

		Dialog.confirm('您确认要退出嘛？',function(){
		
			var isUsercenter = /ucenter/.test(location.pathname);

			Model.getData({act : 8}, function(){

				$('#gUser').html('欢迎访问集沙成塔<a class="login" href="#" id="gLogin" title="请登录">请登录</a>|<a class="reg" href="#" id="gReg" title="免费注册">免费注册</a>');

				delCookie();
				if(isUsercenter){
					location.reload();
				}

				if(cb) cb();

			}, noop, true);

		});
	};

	return Login;

});

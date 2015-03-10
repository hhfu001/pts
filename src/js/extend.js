require(['./m/nav', './m/p1', './m/pay', 'tui/html5form'], function(Nav, P1, Pay, Html5form) {
	Nav.init();

	//申请页面	

	if ($('#extendForm')[0]) {
		P1.init();
	}

	//
	if ($('#payForm')[0]) {

		Pay.init();
	}


	var formStep1 = $('#formStep1');
	var formStep2 = $('#formStep2');
	var formStep3 = $('#formStep3');

	var H5S1 = new Html5form(formStep1, Html5form.VALID_SUBMIT);
	var H5S2 = new Html5form(formStep2, Html5form.VALID_SUBMIT);
	var H5S3 = new Html5form(formStep3, Html5form.VALID_SUBMIT);


	formStep1.on('click', '.submit', function(e){
		e.preventDefault();

		if(!$('[name="username"]').val().trim().length){
			H5S1.tip($('[name="username"]'), '请输入登录名');
			return;
		}

		H5S1.submit();

	});


	formStep2.on('click', '.submit', function(e){
		e.preventDefault();

		if(!$('[name="code"]').val().trim().length){
			H5S2.tip($('[name="code"]'), '请输入验证码');
			return false;
		}

		H5S2.submit();

	});


	formStep3.on('click', '.submit', function(e){
		e.preventDefault();

		var pwd = $('[name="pwd"]').val().trim();
		var ckpwd = $('[name="ckpwd"]').val().trim();

		if(!/^\w{6,}$/.test(pwd)){
			H5S3.tip($('[name="pwd"]'), '请输入至少六位数的密码');
			return false;
		}

		if(pwd != ckpwd){
			H5S3.tip($('[name="ckpwd"]'), '两次输入的密码不一致');
			return false;
		}

		// H5S3.submit();

	}).on('blur', '[name="ckpwd"]', function(){
		var pwd = $('[name="pwd"]').val().trim();
		var ckpwd = $('[name="ckpwd"]').val().trim();
		
		if(pwd != ckpwd){
			H5S3.tip($('[name="ckpwd"]'), '两次输入的密码不一致');
			return false;
		}

	});


});
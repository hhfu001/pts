define([
	'tui/html5form',
	'tui/dialog',
	'tui/art'
], function(Html5form, Dialog, Art) {
	return function(node){

		var form = $(node).find('form');
		var h5form= new Html5form(form);
		var tipArt = Art.compile(require.text('./tips.tpl'));

		var name = form.find('[name=name]');
		var pwd = form.find('[name=pwd]');
		var tpwd = form.find('[name=tpwd]');
		var company = form.find('[name=company]');
		var linker = form.find('[name=linker]');
		var phone = form.find('[name=phone]');
		var email = form.find('[name=email]');
		var code = form.find('.code');
		var codeIpt = form.find('[name=code]');
		var codeSucc = false;
		var emailSucc = false;
		var nameSucc = false;

		form.on('click', '.btn-reg', function(e){
			e.preventDefault();

			if( !nameSucc ){
				h5form.tip(name, '用户名无效');
				return;
			}

			var pval = pwd.val();
			if(pval.length < 6 || !/[^\u4e00-\u9fa5]+/.test(pval)){
				h5form.tip(pwd, '至少输入六位数密码');
				return;
			}


			if(pval !== tpwd.val() ){
				h5form.tip(pwd, '输入的两次密码不一致');
				return;
			}

			if(company.length){

				if(company.val().trim().length < 2){
					h5form.tip(company, '请填写正确的名称');
					return;
				}

				if(!/^1[^2]\d{9}$/.test(phone.val().trim())){
					h5form.tip(phone, '手机格式不符合');
					return;
				}

				if(linker.val().trim().length < 2){
					h5form.tip(linker, '请填写正确的联系人');
					return;
				}
			}

			if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test( email.val().trim()) || !emailSucc){
				h5form.tip(email, '邮箱无效或已注册!');
				return;
			}

			if(!codeSucc){
				h5form.tip(codeIpt, '验证码无效');
				return;
			}

			var params = form.serialize();

			$.post('reg.php', params, function(res){

				var dlg = new Dialog({
					className : 'tip_dialog',
					content : tipArt({msg : res.msg})
				});
				

			});

			// form.submit();

		}).on('click', '.code', function(e){
			e.preventDefault();

			var me = $(this);
			var ipt = form.find('.idcode');
			var id = me.attr('codeId');

			me.attr('src', 'get_code.php?load=yes&id=' + id+ '&' + Math.random());
		});



		pwd.on('blur', function(){
			var me =  $(this);
			var val = me.val();

			if( !/[^\u4e00-\u9fa5]+/.test(val) || val.length < 6 ){
				h5form.tip(me, '输入至少6位的除汉字外的字符');
			}

		});

		tpwd.on('blur', function(){
			var me =  $(this);

			if(me.val().trim() !== pwd.val() ){
				h5form.tip(me, '两次输入的密码不一致');
			}

		});

		name.on('blur', function(){
			var me =  $(this);
			var val = me.val();
			
			if(val.length < 1){
				h5form.tip(me, '请填写账号名称');
				return;
			}

			$.post('check.php', { act: 'name', v: val }, function(res) {

				nameSucc = res == 1;

				if(!nameSucc){
					h5form.tip(me, '账号已存在！');
				}

			}, 'json');

		});

		email.on('blur', function(){
			var me =  $(this);
			var val = me.val();
			
			if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test(val)){
				h5form.tip(me, '请填写邮箱');
				return;
			}

			$.post('check.php', { act: 'email', v: val}, function(res) {

				emailSucc = res == 1;
				if(!emailSucc){
					h5form.tip(me, '该邮箱已注册！');
				}

			}, 'json');

		});

		codeIpt.on('input', function(){

			var me =  $(this);
			var val = me.val();

			if(val.length == 5){

				$.post('check.php', { act: 'code', v: val , id: code.attr('codeId') }, function(res) {
					codeSucc = res == 1;

					if(!codeSucc){
						h5form.tip(me, '验证码无效');

						code.attr('src', 'get_code.php?load=yes&id=' + code.attr('codeId') + '&' + Math.random());
					}

				}, 'json');

			}

		});

	}

});
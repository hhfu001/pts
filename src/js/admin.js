require([
	'./m/nav', 
	'module/pie', 
	'./m/buyform', 
	'./m/mselect',
	'tui/html5form',
	'tui/dialog',
	'tui/art',
	'./m/model',
	'tui/countdown',
	'./m/address',
	'tui/util/url'
], function(Nav, Pie, Buyform, MSelect, Html5form, Dialog, Art, Model, Countdown, Address, Url){
	Nav.init();
	
	Pie.init();


	Buyform();

	MSelect.init($('#infoForm .selects'), [window.province || 0, window.city || 0, window.district || 0]);

	//修改密码
	var pwdForm = $('#ChangePWD');
	var pwdH5 = new Html5form(pwdForm, Html5form.VALID_BLUR);
	var $opwd = pwdForm.find('[name="opassword"]');
	var $npwd = pwdForm.find('[name="npassword"]');
	var $mpwd = pwdForm.find('[name="rnpassword"]');

	pwdForm.on('click', '.submit', function(e){
		e.preventDefault();
		var params = {};

		params.opassword = $opwd.val().trim(); 
		if(!/\w{6,}/.test(params.opassword)){
			pwdH5.tip($opwd, '格式不正确');
			return;
		}

		params.npassword = $npwd.val().trim(); 
		if(!/\w{6,}/.test(params.npassword)){
			pwdH5.tip($npwd, '请输入至少六位数的密码');
			return;
		}

		if(params.npassword == params.opassword){
			pwdH5.tip($mpwd, '你输入的密码和旧密码相同');
			return;
		}

		params.rnpassword = $npwd.val().trim(); 
		if(params.npassword !== params.rnpassword){
			pwdH5.tip($mpwd, '两次输入的密码不一致');
			return;
		}

		params.act = 10;
		Model.postData(params, function(res){

			Dialog.alert('修改成功');
		});
	}).on('blur', 'input[name="rnpassword"]', function(){
		var me =  $(this);

		if(me.val().trim() !== pwdForm.find('[name="npassword"]').val().trim()){
			pwdH5.tip(me, '两次输入的密码不一致');
		}
	});


	//修改基本资料
	var infoForm = $('#infoForm');
	var infoH5 = new Html5form(infoForm, Html5form.VALID_BLUR);
	var $realname = infoForm.find('[name="realname"]');
	var $username = infoForm.find('[name="username"]');
	var $idcard = infoForm.find('[name="idcard"]');
	var $email = infoForm.find('[name="email"]');

	infoForm.on('click', '.submit', function(e){
		e.preventDefault();

		if($realname.length && !$realname.val().trim().length){
			infoH5.tip($realname, '请填写真实姓名');
			return;
		}

		if($username.length && !$username.val().trim().length){
			infoH5.tip($username, '请填写昵称');
			return;
		}

		if($idcard.length && !/(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/.test($idcard.val().trim())){
			infoH5.tip($idcard, '请填写身份证号');
			return;
		}

		if(!/^\w+([-+.]\w+)*@\w+([-.]\w+)*\.\w+([-.]\w+)*$/.test( $email.val().trim() )){
			infoH5.tip($email, '请填写email');
			return;
		}

		var params = infoForm.serialize();
		Model.postData(params, function(res){
			Dialog.alert('修改成功');
		});

	});



	//找回密码
	$('.get-code').on('click', function(e){
		e.preventDefault();
		var me = $(this);

		if(me.hasClass('sending')) return;
		
		me.html('<i>60</i>秒后可重新获取').addClass('sending');

		var $i = me.find('i');
		Countdown($i, 60, function(){
			me.html('获取手机验证码').removeClass('sending');
		});

		Model.getData({act: 11}, function(res){
			if(res.data){
				console.log(res.msg);
			}
		});

	});





	// 管理收获地址
	var adsItemTpl = require.text('./tpl/addressitem.tpl');
	var adsItemArt = Art.compile(adsItemTpl);

	$('#MAddress').on('click', '[data-role="edit"]', function(e){
		e.preventDefault();
		var me = $(this);

		var dlg = new Dialog({
			className : 'address_dialog',
			content : '<form id="dialogAddress"></form>'
		});

		var oAddress = new Address({
			element: $('.new-address'),
			targetNode: $('#dialogAddress')
		});

		var parent = me.closest('.item-address');
		var obj = parent.find('[data-address]').attr('data-address');

		obj = JSON.parse(obj);

		var data = {
			addressId : me.attr('data-id'),
			name : parent.find('[data-role=name]').text(),
			zipcode : parent.find('[data-role=code]').text(),
			tel : parent.find('[data-role=tel]').text(),
			address : parent.find('[data-role=tel]').text()
		};


		oAddress.render({data: data});

		MSelect.init($('#dialogAddress .selects'), [obj.province || 0, obj.city || 0, obj.district || 0]);



		oAddress.bind('add:success', function(params){
			parent.html(adsItemArt(params));
			
			oAddress.close();
			dlg.close();
		});


	}).on('click', '[data-role="del"]', function(e){
		e.preventDefault();

		var me = $(this);
		var params = {};
		var parent = me.closest('.item-address');

		params.addressId = me.attr('data-id');
		params.act = 14;

		if(!params.addressId){
			console.error('can not find addressId!');
			return;
		}


		Dialog.confirm('你确定要删除嘛？',function(){

			parent.addClass('bounce-out');

			setTimeout(function(){

				Model.postData(params, function(res) {

					if (res.data) {
						parent.remove();

					} else {
						Dialog.alert(res.msg);
					}


				}, function() {}, true);
			}, 250);
			
		});
		



	}).on('click', '.add-new', function(e){
		e.preventDefault();

		if($('.item-address-list').length >= 10){
			Dialog.alert('对不起，最多只能添加10个收货地址');
			return;
		}

		var parent = $(this).closest('.op-address');

		var dlg = new Dialog({
			className : 'address_dialog',
			content : '<form id="dialogAddress"></form>'
		});

		var oAddress = new Address({
			element: $('.new-address'),
			targetNode: $('#dialogAddress')
		});

		oAddress.render();

		MSelect.init($('#dialogAddress .selects'));

		oAddress.bind('add:success', function(params){
			parent.before('<div class="item-address item-address-list">'+ adsItemArt(params) +'</div>');
			
			oAddress.close();
			dlg.close();
		});

	});



	//提现
	var tixianForm = $('#tixianForm');
	var tixianH5 = new Html5form(tixianForm, Html5form.VALID_BLUR);
	var $amount = infoForm.find('[name="amount"]');
	var $accountId = infoForm.find('[name="accountId"]');
	var $accountName = infoForm.find('[name="accountName"]');

	tixianForm.on('click', '.submit', function(e){
		e.preventDefault();

		if( !/^[0-9]*[1-9][0-9]*$/.test($amount.val())){
			tixianH5.tip($amount, '请输入正整数提现金额');
			return;
		}

		if($accountId.length && !$accountId.val().trim().length){
			tixianH5.tip($accountId, '请输入转入账户账号');
			return;
		}
		
		if($accountName.length && !$accountName.val().trim().length){
			tixianH5.tip($accountName, '请输入转入账户名');
			return;
		}

		var params = tixianForm.serialize();
		params.act = 15;
		Model.postData(params, function(res){
			Dialog.alert('提现成功！');
		});

	});

	//提现
	$('#btnTixian').on('click', function(e){
		e.preventDefault();
		var me = $(this);

		Model.getData({act: 16}, function(res){
			if(res.data){
				// console.log(res.msg);
				Url.openURL(me.attr('href'));
			}else{
				Dialog.alert('余额不足！');
			}
		});

	})


	




});
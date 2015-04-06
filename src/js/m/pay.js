define([
	'tui/html5form',
	'tui/art',
	'module/numstep',
	'tui/util/num',
	'tui/util/url',
	'./model',
	'tui/dialog',
	'./address',
	'./mselect',
	'./login'
], function(Html5form, Art, Numstep, Num, Url, Model, Dialog, Address, MSelect, Login, require, exports) {

	function noop(){}
	var base_domain = window.base_domain || '';

	function setCost(){

		var $cost = $('#cost');
		// var iptCost = $('input[name="cost"]');
		var total = 0;

		$('#payItems .total').each(function(i, item){

			total = total + parseInt($(item).attr('data-total'));
		});

		// iptCost.val(total);
		$cost.text(Num.split(total));
	}

	exports.init = function() {

		$('#payItems .item').each(function(i, item){
			var me = $(item);
			var numstep = new Numstep({node: item});
			var price = me.find('.p1').attr('data-price');
			var $num = me.find('.buynum');
			var buyNum = $num.length? $num.val() : 1;
			var $total = me.find('.total');

			$total.text(Num.split( buyNum * price)).attr('data-total', buyNum * price);
			numstep.bind('num:step', function(current){

				$total.text(Num.split( current * price)).attr('data-total',current * price);

				setCost();
			});
			setCost();
		});

		

		//添加新地址
		var newNode = new Address({
			element: $('.new-address'),
			targetNode: $('.add-address'),
			renderMethod: 'after'
		});

		newNode.bind('close', function(){
			$('.add-address').show();
		});

		newNode.bind('add:success', function(params, res) {
			var node = newNode.element;
			var p = node.find('[name="province"] option:selected').text() + node.find('[name="city"] option:selected').text() + node.find('[name="district"] option:selected').text() + '&nbsp;' +
				params.address + '&nbsp;' +
				params.tel + '&nbsp;' +
				params.zipcode;

			$('#addressList').append('<li><label><input name="addressId" type="radio" value="' + res.data.addressId + '" checked /> <span>' + params.receiver + '</span></label>' + p + '</li>');

			newNode.close();
		});

		$('#address').on('click', '.add-address', function(e) {
			e.preventDefault();

			if($('#addressList li').length >= 10){
				Dialog.alert('对不起，最多只能添加10个收货地址');
				return;
			}

			$(this).hide();
			newNode.render({});

			MSelect.init($('.selects'));
		});

		// 订单列表
		$('#payItems').on('click', '.close', function(e){
			e.preventDefault();

			var $item = $(this).closest('.item');

			//todo
			$item.remove();

			setCost();

		});

		// 提交订单
		var $payForm = $('#payForm');
		var submiting;

		$('#payForm').on('click', '.submit', function(e){
			e.preventDefault();
			
			if(submiting) return;

			Login.needLogin(function(){
				
				var params = $payForm.serialize();
				submiting = true;
				Model.postData(params, function(res){
					
					if(res.data){
						Dialog.alert('提交订单成功!');
						
						setTimeout(function(){
							Url.openURL( base_domain + '/payinfo/');

						}, 1000)

					}else{
						Dialog.alert('提交订单出错');
					}

					submiting = false;
				}, function(){
					submiting = false;
				}, true);

			});

		});

	};

});
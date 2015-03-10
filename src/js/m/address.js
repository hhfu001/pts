define([
	'tui/html5form',
	'tui/widget',
	'./model'
], function(Html5form, Widget, Model) {

	var tpl = require.text('../tpl/address.tpl');

	var klass = Widget.extend({
		// 事件代理
		events: {
			'click [data-role=save]': function(e) {
				e.preventDefault();
				
				this.save();

			},

			'click [data-role=close]': function(e) {
				e.preventDefault();
				this.close();
			}
		},
		template: tpl,
		// 构造方法
		initialize: function(config) {

			klass.superClass.initialize.call(this, config);
		},

		save: function(act) {
			var me = this;
			var node = me.element;

			var form = node.closest('form');
			var H5Frm = new Html5form(form, Html5form.VALID_BLUR);
			var $tel = node.find('.ipt-tel');
			var $name = node.find('.ipt-name');
			var $address = node.find('.ipt-address');
			var $list = $('#addressList');
			var $postcode = node.find('.ipt-code');
			var $addressId = node.find('[name=addressId]');

			var params = {};

			params.receiver = $name.val();
			if (params.receiver.length < 2) {
				H5Frm.tip($name, '请输入收件人姓名');
				return false;
			}

			params.address = $address.val();
			if (params.address.length < 2) {
				H5Frm.tip($address, '请输入收件人地址');
				return false;
			}

			params.tel = $tel.val();
			if (!/^1[3|5|8|7|4|6][0-9]{9}$/.test(params.tel)) {
				H5Frm.tip($tel, '请输入有效的电话号码');
				return false;
			}

			params.receiver = $name.val();
			params.province = node.find('[name="province"]').val() || '';
			params.city = node.find('[name="city"]').val() || '';
			params.district = node.find('[name="district"]').val() || '';
			params.zipcode = $postcode.val();
			params.act = 4;

			// 编辑
			if($addressId.length){
				params.addressId = $addressId.val(); 
				params.act = 13;
			}

			Model.postData(params, function(res) {

				if (res.data) {

					params.addressId = params.addressId ? params.addressId : res.data.addressId;
					params.tprovince = node.find('[name="province"] option:selected').text();
					params.tcity = node.find('[name="city"] option:selected').text()
					params.tdistrict = node.find('[name="district"] option:selected').text()

					me.trigger('add:success', [params]);

			// 		// me.close();
				} else {
					Dialog.alert('添加地址出错');
				}


			}, function() {}, true);
		},
		del: function(id) {
			var params = {};

			params.addressId = id;
			params.act = 14;

			Model.postData(params, function(res) {

				if (res.data) {

					me.trigger('del:success', []);

				} else {
					Dialog.alert(res.msg);
				}


			}, function() {}, true);
		},
		close: function() {
			// e.preventDefault();

			this.element.remove();
			this.element = null;
			this.trigger('close', []);
		}



	});

	return klass;


});
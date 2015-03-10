define(['./model', 'tui/art'], function(Model, Art, require, exports) {
	var tpl = require.text('../tpl/select.tpl');
	var art = Art.compile(tpl);
	var def = {};

	function init(node, parentId, name, current, isAuto) {

		node.find('[name="'+name+'"]').remove();
		if(name === 'city'){
			node.find('[name="district"]').remove();
		}

		Model.getData({
			act: 1,
			parentId: parentId
		}, function(res) {
			var data = res.data.regionList;

			if (data && data.length) {

				node[name === 'province' ? 'html' : 'append'](art({
					data: data,
					name: name,
					current: current
				}));

				//自动补充
				if(isAuto){
					if(name === 'province' && def.city !== 0){
						init(node, def.province, 'city', def.city, true);
					}
					if(name === 'city' && def.district !== 0){
						init(node, def.city, 'district', def.district, true);
					}
				}else{

					if(name === 'city'){
						init(node, data[0][0], 'district', 0, true);
					}

				}

				// return;

				// if(!current) return;

				// if(name === 'province' && def.city != '0'){
				// 	init(node, current, 'city', def.city);
				// }

				// if(name === 'city' && def.district != '0'){
				// 	init(node, current, 'district', def.district);
				// }
			}


		}, function(){}, true);
	}


	exports.init = function(node, arr) {
		if(!node || !node.length) return;

		// 初始化
		if(arr && arr.length){
			def.province = arr[0];
			def.city = arr[1];
			def.district = arr[2];

			init(node, 1, 'province', def.province, true);
		}else{
			init(node, 0, 'province', 0);
		}

		node.on('change', 'select', function() {
			var me = $(this);
			var name = me.attr('name');

			switch (name) {
				case 'province':
					init(node, me.val(), 'city', 0);
					break;
				case 'city':
					init(node, me.val(), 'district', 0);
					break;
			}

		})


	}



})
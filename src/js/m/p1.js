define([
	'tui/html5form', 
	'module/tageditor',
	'tui/dialog'
], function(Html5form, Tageditor, Dialog, require, exports) {

	exports.init = function() {

		//感兴趣领域
		var oEditor = new Tageditor({
			targetNode: '#jsTagArea .tag-editor',
			notify: '#jsTagArea .tag-hit',
			tagNew: '',
			maxlength: 20,
			max: 5,
			msgMap: {
				placeholder: '空格或者逗号可以分隔标签哦，或者直接点击激活灰色标签',
				required: '至少要添加一个标签哦~',
				maxlength: '一个标签只能写10个字符啦',
				max: '就有5个标签的名额哦'
			}

		});
		var $tagInput = $('#jsTagArea input[name="tagsarea"]');
		var tagCache = [];

		oEditor.bind('change:add', function(v){

			tagCache.push(v);
			$tagInput.val(tagCache.join('|'));

		});

		oEditor.bind('change:del', function(v){
			var index = $.inArray(v, tagCache);

			if(index > -1){
				tagCache.splice(index, 1);
				$tagInput.val(tagCache.join('|'));
			}

		});

		$('#jsTagArea').on('click', '.tag-list span', function(e){
			var me = $(this);
			var val = me.text();

			var valid =  oEditor.addValid(val);

			if(!valid){
				oEditor.addItem(val);
				// me.addClass('current');
			}else{
				oEditor.showMsg(valid);
			}
		});

		// 感兴趣城市
		var cEditor = new Tageditor({
			targetNode: '#jsTagCity .tag-editor',
			notify: '#jsTagCity .tag-hit',
			tagNew: '',
			maxlength: 20,
			max: 5,
			msgMap: {
				placeholder: '空格或者逗号可以分隔标签哦，或者直接点击激活灰色标签',
				required: '至少要添加一个标签哦~',
				maxlength: '一个标签只能写10个字符啦',
				max: '就有5个标签的名额哦'
			}

		});
		var $cityInput = $('#jsTagCity input[name="tagscity"]');
		var cityCache = [];

		cEditor.bind('change:add', function(v){

			cityCache.push(v);
			$cityInput.val(cityCache.join('|'));

		});

		cEditor.bind('change:del', function(v){
			var index = $.inArray(v, cityCache);

			if(index > -1){
				cityCache.splice(index, 1);
				$cityInput.val(cityCache.join('|'));
			}

		});

		$('#jsTagCity').on('click', '.tag-list span', function(e){
			var me = $(this);

			if(me.hasClass('more')){
				showMore();
			}else{
				addCity(me.text());
			}
			
		});


		function addCity(val){
			var valid =  cEditor.addValid(val);

			if(!valid){
				cEditor.addItem(val);
				// me.addClass('current');
			}else{
				cEditor.showMsg(valid);
			}
		}

		function showMore(){
			// var dt = new Dialog({
			// 	className: 'city-dialog',
			// 	content: ''
			// });
		}


		// 
		$('.jsTab').on('click', '.btn-select', function(e) {
			e.preventDefault();
			var me = $(this);
			var tab = me.parent().siblings('.row');
			var ipt = me.siblings('input');

			if (me.hasClass('current')) return;

			tab.hide().eq(me.index()).show();

			me.addClass('current').siblings().removeClass('current');
			ipt.val(me.attr('data'));

		});

		var extendForm = $('#extendForm');
		var extendH5 = new Html5form(extendForm);
		var project = extendForm.find('.project');
		var myprojects = extendForm.find('#myprojects');
		var $plist = extendForm.find('.project-list');

		extendForm.on('click', '.submit', function(e) {
			e.preventDefault();

			var agree = extendForm.find('.agree');
			if (agree.attr('checked') !== 'checked') {
				extendH5.tip(agree, '请阅读此项！')
				return;
			}

			extendForm.submit();
		}).on('keydown', '.project', function(e) {
			var me = $(this);

			if (e.keyCode == 13) {
				e.preventDefault();

				var _val = me.val().trim();

				pushStack(_val);
				return false;
			}
		}).on('click', '.rm', function(e) {
			e.preventDefault();
			var parent = $(this).closest('li');

			pullStack(parent);

		});


		function pushStack(_val) {
			var _cahce = myprojects.val().trim().split('|');

			if (_val.length && $.inArray(_val, _cahce) < 0) {
				_cahce.push(_val);

				myprojects.val(_cahce.join('|'));
				project.val('');
				$plist.append('<li data="' + _val + '"><span>' + _val + '<i class="rm">x</i></span></li>');
			}
		}

		function pullStack(node) {
			var _val = node.attr('data');
			var _cahce = myprojects.val().trim().split('|');
			var idx = $.inArray(_val, _cahce);

			if (idx > -1) {
				_cahce.splice(idx, 1);
				myprojects.val(_cahce.join('|'));
			}

			node.remove();
			node = null;
		}
	};

});
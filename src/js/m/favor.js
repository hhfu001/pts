define([
	'./model',
	'tui/event',
	'tui/dialog'
], function(Model, Event, Dialog){

	var Favor = new Event();
	//<a href="#" class="btn btn-favor favored"><i></i><span class="f1">784</span><span class="f2">取消关注</span></a>

	Favor.init = function(node){
		node = $(node);

		node.find('[data-role="favor"]').each(function(i, item){

			var me = $(this);
			var id = me.attr('data-id');

			check(me, id);

		});

		node.on('click', '[data-role="favor"]', function(e){
			e.preventDefault();
			var me = $(this);

			me.hasClass('favored') ? unFavor(me) : toFavor(me);

		});
	};

	function render(node, isFavor, init){
		var $num = node.find('.f1');
		var $txt = node.find('.f2');
		var num = parseInt($num.text().trim(), 10);

		if(isFavor){
			$num.text( init ? num : num + 1);
			$txt.text('取消关注');
			node.addClass('favored');
		}else{
			$num.text(num - 1);
			$txt.text('关注');
			node.removeClass('favored');
		}

	}

	function toFavor(node){
		var param = {};
		param.productId = node.attr('data-id');
		param.act = 12;

		Model.getData(param, function(){
			render(node, true);
		});
	}

	function unFavor(node){

		// Model.getData({}, function(){
			render(node, false);
		// });
	}


	function check(node, id){


		// Model.getData({}, function(res){


			// render(node, true, true);

		// });
	}


	return Favor;
});
define([
	'tui/util/num',
	'module/numstep',
	'./login'
], function(Num, Numstep, Login) {


	return function() {
		var $node = $('#buyForm');
		var $total = $node.find('input[name="total"]');
		var $total2 = $node.find('.total');
		var price = $node.find('.price').attr('data-price');


		var numstep = new Numstep({node: $node, step: 1});

		numstep.bind('num:step', function(current){

			$total.val(current * price);
			$total2.text( Num.split( current * price));
		});


		$node.on('submit', function(e){
			if(!Login.isLogin()){
				e.preventDefault();
				Login.needLogin();
			}
		});

	};

});
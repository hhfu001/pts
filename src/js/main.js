require(['./m/nav', 'module/pie', './m/buyform', './m/share', './m/favor'], function(Nav, Pie, Buyform, Share, Favor){
	Nav.init();
	
	Pie.init();


	Buyform();

	Share();


	Favor.init('#buyForm');


});
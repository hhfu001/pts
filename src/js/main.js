require(['app/nav', 'app/share', 'module/switchtab'], function(Nav, Share, Switchtab) {
	Nav.init({
		disabled: true
	});


	Share();

	var $albumShow = $('#albumShow');
	var newTab = new Switchtab({
		box : $albumShow,
		panel : 'li',
		slide: true
		// loop: 3000
	});	
	
	// newTab.bind('before', function(prev, cur) {
	// 	loadImg(me, cur);
	// 	cb && cb(prev, cur, newTab.size);
	// });
	$albumShow.bind('mouseenter', function(){
		newTab.stop();
	}).bind('mouseleave', function(){
		newTab.start();
	});
	
	$albumShow.delegate('.next', 'click', function(e){
		e.preventDefault();
		var prev = newTab.current;
							
		if (prev > newTab.size) {
			newTab.go(0);
		} else {
			newTab.next(true);
		}			
	}).delegate('.prev', 'click', function(e){
		e.preventDefault();
		var prev = newTab.current;
							
		if (prev < 1) {
			newTab.go(newTab.size - 1);
		} else {
			newTab.prev(true);
		}				
	});

});
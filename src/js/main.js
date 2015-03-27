require(['app/nav', 'app/share', 'module/switchtab'], function(Nav, Share, Switchtab) {
	Nav.init({
		disabled: false
	});


	Share();

	var $albumShow = $('#albumShow');
	var newTab = new Switchtab({
		box : $albumShow,
		panel : 'li',
		slide: true,
		loop: 300000
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
			// newTab.go(0);
			alert('最后一张了！')
		} else {
			newTab.next(true);
		}			
	}).delegate('.prev', 'click', function(e){
		e.preventDefault();
		var prev = newTab.current;
							
		if (prev < 1) {
			alert('前面没有了！')
			// newTab.go(newTab.size - 1);
		} else {
			newTab.prev(true);
		}				
	});

});
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
		loop: 600000
	});	
	loadImg(0);
	newTab.bind('before', function(prev, cur) {
		loadImg(cur);
	});
	
	$albumShow.bind('mouseenter', function(){
		newTab.stop();
	}).bind('mouseleave', function(){
		newTab.start();
	});
	
	$albumShow.delegate('.next', 'click', function(e){
		e.preventDefault();
		var prev = newTab.current;

		if (prev > newTab.size) {
			alert('这已经是第一页了！')
		} else {
			newTab.next(true);
		}			
	}).delegate('.prev', 'click', function(e){
		e.preventDefault();
		var prev = newTab.current;
		
		if (prev < 1) {
			alert('这已经是最后一页了！')
		} else {
			newTab.prev(true);
		}				
	});

	function loadImg(index){

		var img = newTab.panel.eq(index).find('img');
		var src = img.attr('lazyImg');

		if(img.length && src){
			img.attr('src', src);
			img.removeAttr('lazyImg');
		}

	}



});
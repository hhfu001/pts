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
	loadImg(1);

	newTab.bind('before', function(prev, cur) {
		loadImg(cur);
		loadImg(cur + 1);
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

	var hList = [270, 909, 2365, 3398];
	var $win = $(window);
	$('.page-post').on('click', '.go', function(e){
		// e.preventDefault();

		var me = $(this);
		var sec =  hList[ me.attr('link')];

		if(!sec) return;
		$win.animate({
			scrollTop: sec
		}, 500);
	});

	$win.on('scroll', function(){
		var top = $win.scrollTop();

		$('.gotop')[top> 900 ? 'show' : 'hide']();

	});



});
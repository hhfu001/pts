require(['app/nav', 'app/share', 'tui/html5form', 'module/switchtab'], function(Nav, Share, Html5form, Switchtab) {
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

	//注册
	$('#pageReg').on('click', '.btn', function(e){
		e.preventDefault();
		var self = $(this);

		if(self.hasClass('current')) return;

		self.addClass('current').siblings().removeClass('current');

		if(self.index() == 0){
			$('.form-enter').hide();
			$('.form-personal').show();
		}else{
			$('.form-enter').show();
			$('.form-personal').hide();
		}
	});


	var pForm = $('.form-personal form');
	var eForm = $('.form-enter form');
	var h5form1 = new Html5form(pForm);
	var h5form2 = new Html5form(eForm);

	$('#personalReg').on('click', function(e){
		e.preventDefault();

		pForm.submit();
	});

	pForm.on('click', '.code', function(e){
		e.preventDefault();

		var me = $(this);
		var ipt = pForm.find('.idcode');

		$.ajax({
			url: '',
			success: function(res){
				var src = res ;
				var res = {
					src: '12',
					code: '222'
				}

				me.attr('src', res.src);
				ipt.val( res.code);
			}
		});
	})

	$('#enterReg').on('click', function(e){
		e.preventDefault();

		eForm.submit();
	});

	eForm.on('click', '.code', function(e){
		e.preventDefault();

		var me = $(this);
		var ipt = eForm.find('.idcode');

		$.ajax({
			url: '',
			success: function(res){
				var src = res ;
				var res = {
					src: '12',
					code: '222'
				}

				me.attr('src', res.src);
				ipt.val( res.code);
			}
		});
	})



});
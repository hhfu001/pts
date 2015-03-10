require(['./m/nav', 'module/odometer', 'module/slider', 'tui/util/num'], function(Nav, Odometer, Slider, Num) {
	Nav.init();

	window.odometerOptions = {
		format: '(,ddd)'
	};


	var $focus = $('#jsFocus');
	var slider = new Slider({
		box: $focus,
		tab: '.btns a',
		panel: 'li',
		fade: true,
		duration: 500,
		loop: 5000
	});

	$focus.on('click', '.prev', function(e){
		e.preventDefault();
		prev();

	}).on('click', '.next', function(e){
		e.preventDefault();
		next();
	}).on('mouseenter', function(){
		$(this).addClass('hover');
		slider.stop();
	}).on('mouseleave', function(){
		$(this).removeClass('hover');
		slider.start();
	});


	function next() {
		var prev = slider.current;
		if (prev > slider.size) {
			slider.go(0);
		} else {
			slider.next(true);
		}
	}

	function prev() {
		var prev = slider.current;

		if (prev < 1) {
			slider.go(slider.size - 1);
		} else {
			slider.prev(true);
		}
	}



	//
	if($.browser.msie && $.browser.version == '6.0') {
		document.execCommand('BackgroundImageCache', false, true);
	}

	var isIE = $.browser.msie && parseInt($.browser.version < 8);

	$('.odometer').each(function(i, item) {
		var num = $(item).attr('data-num');

		if(!isIE){
			var od = new Odometer({
				el: item,
				value: 0
			});

			od.update(num)

		}else{
			$(item).text(Num.split(num));
		}

	});



});
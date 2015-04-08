require(['app/nav', 'module/slider', 'module/flexisel'], function(Nav, Slider, Flexisel) {
	Nav.init({disabled: false});


	var $focus = $('#jsFocus');
	var slider = new Slider({
		box: $focus,
		tab: '.btns a',
		panel: 'li',
		fade: true,
		duration: 500,
		loop: 5000
	});

	$focus.on('click', '.prev', function(e) {
		e.preventDefault();
		prev();

	}).on('click', '.next', function(e) {
		e.preventDefault();
		next();
	}).on('mouseenter', function() {
		$(this).find('.prev').css({
			left: '20px'
		});
		$(this).find('.next').css({
			right: '20px'
		});
		slider.stop();
	}).on('mouseleave', function() {
		$(this).find('.prev').css({
			left: '-999px'
		});
		$(this).find('.next').css({
			right: '-999px'
		});
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

	// $('#magazineSlide').flexisel({
	// 	visibleItems: 4,
	// 	animationSpeed: 200,
	// 	autoPlay: false,
	// 	pauseOnHover: true,
	// 	enableResponsiveBreakpoints: false

	// });

	$('#memberSlide').flexisel({
		visibleItems: 7,
		animationSpeed: 1000,
		autoPlay: true,
		// autoPlaySpeed: 50,
		pauseOnHover: true,
		enableResponsiveBreakpoints: false
	});



	var $adc = $('#indexAD .c');
	var first;
	$(window).on('scroll', function(){
		var top = $(window).scrollTop();

		if(top> 500 && !first){
			$adc.addClass('ex');
			$('#indexAD .btn').removeClass('expend');
			first = true;
		}
	});

	$('#indexAD').on('click', '.btn', function(e){
		e.preventDefault();
		var me = $(this);
		if(me.hasClass('expend')){
			me.removeClass('expend');
			$adc.addClass('ex');
		}else{
			me.addClass('expend');
			$adc.removeClass('ex');

		}

	})



});
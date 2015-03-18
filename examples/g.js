function check_all(name){
	var a = document.getElementsByName(name); 
	
	for (var i=0; i<a.length; i++) {
		a[i].checked = !a[i].checked;
	}
}

function sub_check(name){
	var a = document.getElementsByName(name); 
	
	for (var i=0; i<a.length; i++) {
		a[i].checked = a[0].checked;
	}
}

function pre_check(name, obj) {
	var a = document.getElementsByName(name); 
	
	a[0].checked = false;
	for (var i=0; i<a.length; i++) {
		if (a[i].checked == true) {
			a[0].checked = true;
		    break;
		}
	}
}

function app_onchange(obj) {
	var url = window.location.href;
	url += url.indexOf('?') > 0 ? '&': "?";
	url = url + 'app_id='+obj.value;
	
	document.form1.action = url;
	document.form1.submit();
}

function status_onchange(obj) {
	var url = window.location.href;
	url += url.indexOf('?') > 0 ? '&': "?";
	url = url + 'status='+obj.value;

	document.form1.action = url;
	document.form1.submit();
}

function re_collect(id) {
	$.ajax({
	   type: "POST",
	   url: "../ajax/ajax_collect.php",
	   data: "id="+id,
	   success: function(msg){
	     
	   }
	}); 

	$('#td_status_'+id).html( '未完成');
	$('#td_opt_'+id).html('抓取中...');
}

function more_re_collect() {
	var obj = document.getElementsByName('collect_cb_arr[]');
	var ids = '';
	for(var i=0; i<obj.length; i++) {
		if (obj[i].checked == true) {
			re_collect(obj[i].value);
		}
	}
}

function pass_click(id, v) {
	var obj = $("#label_check_"+id+""); 
	
	switch (v) {
		case 'yes':
			$('#btn_no_'+id).css('display', ''); 
			$('#img_no_'+id).css('display', 'none'); 
		 break;
		 case 'no':
			 $('#btn_yes_'+id).css('display', ''); 
			 $('#img_yes_'+id).css('display', 'none'); 
		 break;
	}

	if (obj.val() == v) {
		obj.val('');
		
		$('#btn_'+v+'_'+id).css('display', ''); 
		$('#img_'+v+'_'+id).css('display', 'none'); 
		
	} else {
		$('#btn_'+v+'_'+id).css('display', 'none'); 
		$('#img_'+v+'_'+id).css('display', ''); 
		
		obj.val(v);
	}
}

function candidate_select_all(type) {
	var obj = document.getElementsByName('label_ids[]');
	
	for(var i=0; i<obj.length; i++) {
		pass_click(obj[i].value, type);
	}
	
}

function tr_mouseover(obj) {
	$('#'+obj.id).addClass('tr_hover');
}

function tr_mouseout(obj) {
	$('#'+obj.id).removeClass('tr_hover');
}

function tr_click(obj) {
	$('.tr_list').removeClass('tr_click');
	$('#'+obj.id).addClass('tr_click');
}

function ajax_add_onclick(word, i, id) {
	//var t = i*34+36;
	
	var offset = $('#td_'+id).offset();
	var t= offset.top;
	
	$('#div_label').fadeIn("normal");
	$('#div_label').css('position','absolute');
	$('#div_label').css('margin-top',t+'px');
	$('#hidden_label').val(word);
	$('#input_label').val(word);
	
}


function ajax_add_label() {
	var old_word = $('#hidden_label').val();
	var new_word = $('#input_label').val();
	
	new_word = $.trim(new_word);
	
	if (new_word == '') {
		alert('标签不能为空');
		$('#div_label').fadeOut("normal");
	} else if (old_word == new_word) {
		alert('两个值相同，修改无效');
		$('#div_label').fadeOut("normal");
	} else {
		$.ajax({
		   type: "POST",
		   url: "../ajax/ajax_label.php",
		   data: "word="+new_word,
		   datatype:'json',
		   success: function(msg){
		     var t = jQuery.parseJSON(msg);
		   	   alert(t.msg);
		   }
		}); 
		$('#div_label').fadeOut("normal");
	}
}

function label_ajax_edit_label(t) {
	var old_word = $('#hidden_label').val();
	var new_word = $('#input_label').val();
	var id = $('#hidden_id').val();

	new_word = $.trim(new_word);
	
	if (new_word == '') {
		alert('标签不能为空');
		$('#div_label').fadeOut("normal");
	} else if (old_word == new_word) {
		alert('两个值相同，修改无效');
		$('#div_label').fadeOut("normal");
	} else {
		new_word = new_word.replace(/\+/g, '%2B');
		$.ajax({
		   type: "POST",
		   url: "../ajax/ajax_label.php",
		   datatype:'json',
		   data: "word="+new_word+'&id='+id+'&mtype='+t,
		   success: function(data){
		   	   var t = jQuery.parseJSON(data);
		   	   
			   alert(t.msg);
			   if (t.rtn == 1) {
			   	  new_word = new_word.replace(/%2B/g, '+');
				  $('#td_'+id).html(new_word);
			   }
		   }
		}); 
		
		$('#div_label').fadeOut("normal");
	}
}

function div_cancel() {
	$('#div_label').fadeOut("normal");
}

function edit_click(fid, pid) {
	
	$(".hidden_div").hide();
	$('#lb_'+fid+'_'+pid).hide();
	$("#div_"+fid+"_"+pid).show();
		
}

function edit_submit(fid, pid) {
	$(".hidden_div").hide();
	var level = $('#input_'+fid+'_'+pid).val();
	level = level > 0 ? level : 0;
	$('#lb_'+fid+'_'+pid).html('<center>'+level+'</center>');
	$('#lb_'+fid+'_'+pid).show();
	$.ajax({
	   type: "POST",
	   url: "grade_factor_pixel.php",
	   data: "fid="+fid+'&pid='+pid+'&level='+level+'&action=edit',
	   success: function(msg){
	     
	   }
	}); 
	
}
function mh_edit_submit(fid, pid) {
	$(".hidden_div").hide();
	var level = $('#input_'+fid+'_'+pid).val();
	level = level > 0 ? level : 0;
	$('#lb_'+fid+'_'+pid).html('<center>'+level+'</center>');
	$('#lb_'+fid+'_'+pid).show();
	$.ajax({
	   type: "POST",
	   url: "grade_factor_pixel_mh.php",
	   data: "fid="+fid+'&pid='+pid+'&level='+level+'&action=edit',
	   success: function(msg){
	     
	   }
	}); 
	
}

function cancel_submit(fid,pid) {
	$(".hidden_div").hide();
	$(".show_label").show();
}

function btn_more_click(){
	$('.more_div').show();
	$('.show_label').hide();
	$('.hide_div').hide();
	$('#btn_more').hide();
	$('#btn_sub').show();
}




function div_ajax_edit_onclick(id, e) {
	var offset = $('#td_'+id).offset();
	var t= offset.top - 165;
    var word = $(e).html();
    
	
	$('#div_label').fadeIn("normal");
	$('#div_label').css('position','absolute');
	$('#div_label').css('margin-top',t+'px');
	$('#div_label').css('margin-left',offset.left+'px');
	$('#hidden_label').val(word);
	$('#input_label').val(word);
	$('#hidden_id').val(id);
}

function disturb_ajax_edit() {
	var old_word = $('#hidden_label').val();
	var new_word = $('#input_label').val();
	var id = $('#hidden_id').val();
	
	new_word = $.trim(new_word);
	
	if (new_word == '') {
		alert('标签不能为空');
		$('#div_label').fadeOut("normal");
	} else if (old_word == new_word) {
		alert('两个值相同，修改无效');
		$('#div_label').fadeOut("normal");
	} else {
		$.ajax({
		   type: "POST",
		   url: "disturb_list.php",
		   datatype:'json',
		   data: "word="+new_word+'&id='+id+'&action=ajax',
		   success: function(data){
		   	   var t = jQuery.parseJSON(data);
		   	   
			   alert(t.msg);
			   if (t.rtn == 1) {
				  $('#td_'+id).html(new_word);
			   }
		   }
		}); 
		
		$('#div_label').fadeOut("normal");
	}
}

function grade_rate_edit_clcik(id) {
	$('.hide_list').hide();
	$('.show_list').show();
	$('#tr_'+'show_'+id).hide();
	$('#tr_'+'hide_'+id).show();
}

function grade_rate_hide_click() {
	$('.hide_list').hide();
	$('.show_list').show();
}
function grade_rate_sub_clcik(id) {
	var name = $('#name_'+id).val().trim();
	var rate = $('#rate_'+id).val().trim();
	
	if (name == '' || rate=='') {
		alert('转码名和系数值不能为空!');
	} else {
		$.ajax({
		   type: "POST",
		   url: "grade_video_rate.php",
		   datatype:'json',
		   data: "name="+name+'&rate='+rate+'&id='+id+'&action=ajax',
		   success: function(data){
		   	   var t = jQuery.parseJSON(data);
		   	   
			   alert(t.msg);
			   if (t.rtn == 1) {
				  $('#td_name_'+id).html(name);
				  $('#td_rate_'+id).html(rate);
			   }
		   }
		}); 
		
		$('.hide_list').hide();
		$('.show_list').show();
	}
}

function candidate_start_click(fid){
	$.ajax({
	   type: "POST",
	   url: "monitor_candidate.php",
	   //datatype:'json',
	   data: "fid="+fid+"&action=ajax",
	   success: function(data){
		   alert(data);
	   }
	}); 
}

function segword_start_click(fid){
	$.ajax({
	   type: "POST",
	   url: "monitor_segword.php",
	   //datatype:'json',
	   data: "fid="+fid+"&action=ajax",
	   success: function(data){
		   alert(data);
	   }
	}); 
}
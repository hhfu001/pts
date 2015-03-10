
define('tui/selectbox', [
	'tui/art',
	'tui/event'
], function(Art, Event) {

	var TPL = [
		'<div class="tui_selectbox">',
		'	<div class="tui_selectbox_head" data-stat-role="ck"><span class="tui_selectbox_text"><%=selectedText%></span><i class="tui_selectbox_arrow"></i></div>',
		'	<div class="tui_selectbox_body" data-stat-role="ck">',
		'		<%for (var i = 0; i < list.length; i++) {%>',
		'		<div class="tui_selectbox_option<%if (selectedValue === list[i].value) {%> tui_selectbox_selected<%}%>" data-value="<%=list[i].value%>"><%=list[i].text%></div>',
		'		<%}%>',
		'	</div>',
		'</div>'].join('');

	var NEW_COUNT = 0;

	function select(div, val) {
		var head = div.find('.tui_selectbox_head');
		var body = div.find('.tui_selectbox_body');
		var selectedOption = body.find('[data-value=' + val + ']');

		body.find('.tui_selectbox_option').removeClass('tui_selectbox_selected');

		if (selectedOption.length > 0) {
			var text = selectedOption.text();
			head.find('.tui_selectbox_text').text(text);
			selectedOption.addClass('tui_selectbox_selected');
		}
	}

	function create(selectbox) {
		var self = this;

		var maxHeight = selectbox.attr('data-height') || 200;
		var options = selectbox[0].options;
		var selectedValue = selectbox.val();
		var selectedText = selectedValue;
		var list = [];

		for (var i = 0, len = options.length; i < len; i++) {
			var value = options[i].value;
			var text = options[i].text;
			if (value === selectedValue) {
				selectedText = text;
			}
			list.push({
				value : value,
				text : text
			});
		}

		var data = {
			selectedValue : selectedValue,
			selectedText : selectedText,
			list : list
		};

		var width = selectbox.width();

		var div = $(Art.compile(TPL)(data));
		var head = div.find('.tui_selectbox_head');
		var body = div.find('.tui_selectbox_body');

		head.click(function(e) {
			if (body.is(':visible')) {
				body.hide();
				return;
			}

			var val = div.next('select').val();
			select(div, val);
			body.show();
			if (body.height() > maxHeight) {
				body.css('height', maxHeight + 'px');
			}
		});

		body.on('click', '.tui_selectbox_option', function() {
			var val = $(this).attr('data-value');
            var _val = selectbox.val();
            body.hide();
            if(val !== _val){
                select(div, val);
                selectbox.val(val);
                self.trigger('change', [selectbox]);
            }
		});

		body.on('mouseenter', '.tui_selectbox_option', function() {
			var val = $(this).attr('data-value');

			body.find('.tui_selectbox_option').removeClass('tui_selectbox_selected');
			body.find('[data-value=' + val + ']').addClass('tui_selectbox_selected');
		});

		selectbox.hide().before(div);
	}

	var Selectbox = Event.extend({
		// 构造方法
		initialize : function(expr) {
			var self = this;

			Selectbox.superClass.initialize.call(self);

			var selectboxList = self.selectboxList = $(expr);

			selectboxList.each(function() {
				create.call(self, $(this));
			});

			if (NEW_COUNT === 0) {
				$(document).click(function(e) {
					if ($(e.target).closest('.tui_selectbox').length > 0) {
						return;
					}
					$('div.tui_selectbox .tui_selectbox_body').hide();
				});
			}

			NEW_COUNT++;
		},
		update : function() {
			var self = this;

			self.selectboxList.each(function() {
				var selectbox = $(this);
				var div = selectbox.prev('.tui_selectbox');

				var val = selectbox.val();
				select(div, val);
			});
		}
	});

	return Selectbox;
});

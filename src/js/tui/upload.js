
define('tui/upload', [
	'tui/art',
	'tui/widget'
], function(Art, Widget) {

	var template = ['<div class="tui_upload <%=className%>">',
			'<iframe name="<%=target%>" style="display:none;"></iframe>',
			'<form class="tui_upload_form" method="post" enctype="multipart/form-data" target="<%=target%>" action="<%=url%>">',
			'<%for(var key in params){%>',
			'<input type="hidden" name="<%=key%>" value="<%=params[key]%>">',
			'<%}%>',
			'<div class="tui_upload_btn"><%=btnText%></div>',
			'<input type="file" class="tui_upload_file" name="<%=inputName%>" accept="<%=accept%>" tabindex="-1" />',
			'</form>',
			'</div>'].join('');

	function _unescape(val) {
		return val.replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&amp;/g, '&');
	}

	var Upload = Widget.extend({
		// 构造方法
		initialize : function(config) {
			var self = this;

			var defaults = {
				template : template,
				params : {},
				className : '',
				btnText : '上传图片',
				target : 'tui_upload_iframe_' + new Date().getTime(),
				inputName : 'tuiFile',
				accept : 'image/*',
				autoSubmit : true
			};

			config = $.extend(defaults, config || {});

			config.element = $(Art.compile(config.template)(config));

			Upload.superClass.initialize.call(self, config);

			self.config = config;

			self.dom = {
				iframe : self.find('iframe'),
				form : self.find('.tui_upload_form'),
				file : self.find('.tui_upload_file')
			};

			self.render();

			if (config.autoSubmit) {
				self.dom.file.change(function() {
					self.trigger('change');
					self.submit();
				});
			}
		},
		submit : function() {
			var self = this;
			var config = self.config;
			var iframe = self.dom.iframe;
			var form = self.dom.form;
			var fileBox = self.dom.file;

			function loadHandler() {
				iframe.unbind('load', loadHandler);

				// Bugfix: 清空file
				var tempForm = $('<form/>');
				fileBox.before(tempForm);
				tempForm.append(fileBox);
				tempForm[0].reset();
				tempForm.after(fileBox);
				tempForm.remove();

				var doc = iframe[0].contentDocument || iframe[0].contentWindow.document;
				var str = '';
				try {
					var pre = doc.getElementsByTagName('pre')[0];
					if (pre) {
						str = pre.innerHTML;
					} else {
						str = doc.body.innerHTML;
					}
				} catch (e) {
					self.trigger('error', ['Permission denied']);
					return;
				}
				// Bugfix: https://github.com/kindsoft/kindeditor/issues/81
				str = _unescape(str);
				// Bugfix: [IE] 上传图片后，进度条一直处于加载状态。
				iframe[0].src = 'javascript:false';
				var data;
				try {
					data = $.parseJSON(str);
				} catch (e) {
					self.trigger('error', ['parse JSON error']);
				}
				if (data) {
					self.trigger('success', [data]);
				}
			}

			iframe.bind('load', loadHandler);

			form[0].submit();
		}
	});

	return Upload;
});

define([
	'tui/widget',
	'tui/art'
], function(Widget, Art) {
    var BACKSPACE = 8; //回格
    var ENTER = 13; //回车
    var SPACE = 32; //空格
    var COMMA = 188; //逗号
					
	var Klass = Widget.extend({
		initialize: function(options){
            var self = this;
            var options = options || {};
            options.msgMap = options.msgMap || {};
            Klass.superClass.initialize.apply(self, arguments);
            
			var $targetNode = $(self.targetNode);
            var $tagNew = options.tagNew || $('<span class="tag-new"><input class="tag-input" type="text" autocomplete="off" size="2"></input></span>');
			var $input = $tagNew.find('input');
			
			self.template = options.template || require.text('./tageditor.tpl');
            self.tagNew = $tagNew;
            self.input = $input; //标签输入框
			self.notify = $(options.notify); //标签提示
			self.wordTips = $(options.wordTips); //字数提示
            
            //message
            self.max = options.max || 9999; //最多标签数量
            self.min = options.min ? options.min : 0; //最小标签数量
			self.required = options.required; //是否必填
            self.distinct = options.distinct == false ? false : true; //是否重复
            self.maxlength = options.maxlength || 9999; //字数
            if (self.min == 0 && self.required) {
                self.min = options.msgMap.min = 1;
            }
			self.msgMap = $.extend({
				'placeholder': '标签用空格或者逗号分隔',
                'required': '至少要添加1个标签',
                'distinct': '标签重复',
                'max': '最多只能添加' + self.max + '个标签',
                'min': '至少要添加' + self.min + '个标签',
				'maxlength': '标签不能超过' + self.maxlength + '个字符'
            }, options.msgMap || {})
			
            $targetNode.addClass('tag-editor');
			if (!options.tagNew) {
				$targetNode.append($tagNew);
			}
			$targetNode.click(function(){
				self.input.focus();
			}).delegate('.tag-del', 'click', function(e){
                e.preventDefault();
				e.stopPropagation();

				var box = $(this).closest('.tag-box');
				self.trigger('change:del', [box.find('em').text()]);
                box.remove();
            })
            
			$input.keydown(function(e){
				//撤销
				var val = $.trim($input.val());
				var validType = self.addValid(val);
				var key = e.keyCode;
				if (e.which == BACKSPACE) {
					if ($input.val() == "") {
						e.preventDefault();
						var $last = $targetNode.children(".tag-box:last");
						if ($last.length) {
							var val = $.trim($last.find('em').text());
							$input.val(val);
							$last.remove();
						}
					}
				}
				if (e.which == COMMA || e.which == SPACE || e.which == ENTER) {
					e.preventDefault();
					if (!validType) {
						if (val != '') {
							self.addItem(val);
							$input.val('');
						}
					}
					else {
						self.showMsg(validType);
					}
				}
				if (validType == 0) {
					self.showMsg(validType);
				}
			});
        },
        addItem: function(val, disable, callback){
            var self = this;
            if ($.type(disable) == 'function') {
                callback = disable;
                disable = null;
            }
            self.render(val, disable)
            callback && callback();
			self.trigger('change:add', [val]);
        },
        addItems: function(data, disable, callback){
            var self = this;
            if ($.type(disable) == 'function') {
                callback = disable;
                disable = null;
            }
            if ($.type(data) != 'array') {
                data = [data];
            }
            $(data).each(function(i, o){
                var _disable = o.disable || disable;
                var val = $.trim($.type(o) == 'string' ? o : o.val);
				if (val != '') {
                    self.addItem(val, _disable);
				}
            })
            callback && callback();
        },
        render: function(data, disable){
			var self = this;
			var op = {
				data: $.type(data) == 'array' ? data : [data]
			}
			if (disable) {
				op.disable = true;
			}
			else {
				op.enable = true;
			}

			self.tagNew.before(Art.compile(self.template)({
				data: op,
				$: $
			}));

			self.notify.html('');

        },
		showMsg: function(type, ani){
            var self = this;
            var $notify = self.notify;
            if ($notify.length) {
                type = type || 'placeholder';
                var txt = self.msgMap[type] || type;
                var className = type == 'placeholder' ? 'tag-notify' : 'input-notify-error';
                $notify.html('<div class="' + className + '">' + txt + '</div>');
				if (ani) {
					$notify.hide()[ani]();
				}
            }
		},
        valid: function(){
			var self = this;
			var type = 0;
			var tags = self.getValue();
			if (self.required && tags.length == 0) { //不能为空
				type = 'required';
			}
			else if (tags.length > self.max) { //标签个数超限
				type = 'max';
			}
			return type;
        },
        addValid: function(val){
			var self = this;
			var type = 0;
			var tags = self.getValue();
			if (tags.length > self.max - 1) { //标签个数超限
				type = 'max';
			}
			else if (val.length > self.maxlength) { //标签字数超限
				type = 'maxlength';
			}
			else if (self.distinct && tags.indexOf(val) != -1) { //标签重复
				type = 'distinct';
			}
			return type;
        },
        getValue: function(){
			var self = this;
			var tags = [];
			self.targetNode.find('.tag-enable em').each(function(){
				tags.push($(this).text());
			});
            return tags;
        }
	})
	return Klass;
})
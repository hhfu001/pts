﻿define('tui/tageditor', [
	'tui/widget',
	'tui/template'
], function(Widget, Template) {
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
            var $tagNew = options.tagNew || $('<span class="tag_new"><input class="tag_input" type="text" autocomplete="off" size="2"></input></span>');
			var $input = $tagNew.find('input');
            var enableTags = options.enableTags || [];
            var disableTags = options.disableTags || [];
			
			self.template = require.text('tui/tageditor.tpl');
            self.tagNew = $tagNew;
            self.input = $input; //标签输入框
			self.notify = $(options.notify); //标签提示
			
			//data
            self.enableTags = enableTags; //已存在标签
            self.disableTags = disableTags; //待选标签
            self._enableTags = options._enableTags || []; //初始已存在标签备份
            self._disableTags = options._disableTags || []; //初始待选标签备份
            
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
				'placeholder': '标签用空格或者逗号分隔，灰色标签需激活',
                'required': '至少要添加1个标签',
                'distinct': '标签重复',
                'max': '最多只能添加' + self.max + '个标签',
                'min': '至少要添加' + self.min + '个标签',
                'maxlength': '标签不能超过' + self.maxlength/2 + '个字符'
            }, options.msgMap || {})
			
            $targetNode.addClass('tag_editor');
			if (!options.tagNew) {
				$targetNode.append($tagNew);
			}
			
			//初始化已启用标签
			if (enableTags.length) {
				self.render(enableTags);
			}
			//初始化待启用标签
			if (enableTags.length) {
				self.render(disableTags, true);
			}
			
            var _timer;
            $targetNode.delegate('.tag_disable', 'mouseup', function(e){
                e.preventDefault();
				self.showMsg();
                var $tag = $(this);
                var val = $.trim($tag.find('em').text());
                if (self.addValid(val)) {
                    enableTags.push(val);
                    $(this).removeClass('tag_disable').addClass('tag_enable');
					self.showMsg();
                }
            }).delegate('.tag_del', 'click', function(e){
                e.preventDefault();
				self.showMsg();
                var $tag = $(this).closest('.tag_box');
                var val = $.trim($tag.find('em').text());
                enableTags.splice(enableTags.indexOf(val), 1);
                if (self._disableTags.indexOf(val) != -1 || self._enableTags.indexOf(val) != -1) {
                    $tag.removeClass('tag_enable').addClass('tag_disable');
                } else {
                    $tag.remove();
                }
                self.showMsg();
            }).mousedown(function(){
                setTimeout(function(){
                    if (_timer) 
                        clearTimeout(_timer);
                }, 0)
			}).mouseup(function(e){
				$input.focus();
            })
            $input.click(function(){
				self.showMsg();
			}).blur(function(){
                if (_timer) 
                    clearTimeout(_timer);
                _timer = setTimeout(function(){
                    var val = $.trim($input.val());
                    var res = {
                        status: 1,
                        value: enableTags
                    };
                    if (val != '') {
                        if (self.addValid(val)) {
							self.addItem(val);
							$input.val('');
						} else {
                            res.status = 0;
						}
                    }
                    self.trigger('complete', [res]);
                }, 100);
            }).keydown(function(e){
				self.showMsg();
				if (e.which == BACKSPACE) {
					if ($input.val() == "") {
						e.preventDefault();
                        var $last = $targetNode.children(".tag_box:last");
						if ($last.length) {
							var val = $.trim($last.text());
							$input.attr('size', Math.min(Template.strsize(val) + 6, 20));
							$input.val(val);
							$last.remove();
							if ($last.hasClass('tag_enable')) {
								enableTags.splice(enableTags.indexOf(val), 1);
							}
						}
						
					}
				} else if (e.which == COMMA || e.which == SPACE || e.which == ENTER) {
					e.preventDefault();
                    var val = $.trim($input.val());
                    if (val != '' && self.addValid(val)) {
						self.addItem(val);
						$input.val('');
						self.showMsg();
					}
				}
            }).keyup(function(e){
                var val = $input.val();
				//中文逗号
                if (e.which == COMMA) {
                    e.preventDefault();
					val = val.replace(/\，/g, '');
                    $input.val(val);
                    if (val != '' && self.addValid(val)) {
						self.addItem(val);
						$input.val('');
					}
                } else {
                    $input.attr('size', Math.min(Template.strsize(val) + 6, 20));
                }
            })
			
			//初始化已存在标签
			$targetNode.find('.tag_box').each(function(){
                var $tag = $(this);
                var val = $.trim($tag.find('em').text());
                if ($tag.hasClass('tag_enable') && enableTags.indexOf(val) == -1) {
                    enableTags.push(val);
                }
                else if ($tag.hasClass('tag_disable') && disableTags.indexOf(val) == -1) {
                    disableTags.push(val);
                }
			});
			self.resetTags();
			
			self.isAlwaysTip = options.isAlwaysTip === true ? true : false;
			if (self.isAlwaysTip) {
				self.showMsg();
			}
        },
        addItem: function(val, disable, callback){
            var self = this;
            if ($.type(disable) == 'function') {
                callback = disable;
                disable = null;
            }
            self[disable ? 'disableTags' : 'enableTags'].push(val);
            self.render(val, disable)
            callback && callback();
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
                data: data
            }
            if (disable) {
                op.disable = true;
            } else {
                op.enable = true;
            }
            self.tagNew.before(Template.convertTpl(self.template, op));
        },
		showMsg: function(type){
            var self = this;
            var $notify = self.notify;
            if ($notify.length) {
                type = type || 'placeholder';
                var txt = self.msgMap[type] || type;
                var className = type == 'placeholder' ? 'tag_notify' : 'tag_error';
                $notify.html('<div class="' + className + '">' + txt + '</div>');
            }
		},
        valid: function(nomsg){
            var self = this;
            var enableTags = self.enableTags;
            var ret = true;
            var type = 0;
            if (self.required && enableTags.length == 0) { //不能为空
                type = 'required';
                ret = false;
            } else if (enableTags.length > self.max) { //标签个数超限
                type = 'max';
                ret = false;
            }
            if (!nomsg && type) {
                self.showMsg(type);
            }
            return ret;
        },
        addValid: function(val, nomsg){
            var self = this;
            var enableTags = self.enableTags;
            var ret = true;
            var type = 0;
            if (enableTags.length > self.max-1) { //标签个数超限
                type = 'max';
                ret = false;
            } else if (Template.strsize(val) > self.maxlength) { //标签字数超限
                type = 'maxlength';
                ret = false;
            } else if (self.distinct && enableTags.indexOf(val) != -1) { //标签重复
                type = 'distinct';
                ret = false;
            }
            if (!nomsg && type) {
                self.showMsg(type);
            }
            return ret;
        },
		isChanged: function(){
            var self = this;
            var enableTags = self.enableTags;
            var _enableTags = self._enableTags;
            var ret = false;
            $(enableTags).each(function(i, o){
                if (_enableTags.indexOf(o) == -1) {
                    ret = true;
                }
            })
            $(_enableTags).each(function(i, o){
                if (enableTags.indexOf(o) == -1) {
                    ret = true;
                }
            })
            return ret;
		},
		resetEnableTags: function(){
			var self = this;
            self._enableTags = [];
            $(self.enableTags).each(function(i, o){
                self._enableTags.push(o);
            })
		},
		resetDisableTags: function(){
            var self = this;
            self._disableTags = [];
            $(self.disableTags).each(function(i, o){
                self._disableTags.push(o);
            })
		},
		resetTags: function(){
			var self = this;
            self.resetEnableTags();
            self.resetDisableTags();
		},
		getEnableTags: function(){
			return this.enableTags;
		},
		getDisableTags: function(){
			return this.disableTags;
		},
        getValue: function(){
            return this.getEnableTags();
        }
	})
	return Klass;
})

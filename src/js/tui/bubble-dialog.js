define('tui/bubble-dialog', [
	'tui/event',
	'tui/dialog',
	'tui/widget',
	'tui/stick'
], function(Event, Dialog, Widget, Stick) {
	var oSingleDialog;
    var Klass = Widget.extend({
        initialize: function(options){
			options = options || {};
            options.offset = options.offset || {};
            var self = this;
            Klass.superClass.initialize.apply(self, arguments);
			
			//位置
            self.position = options.position || 12;
			//位置偏移量
            self.left = options.offset.left ? options.offset.left : 0;
            self.top = options.offset.top ? options.offset.top : 0;
			//单例
            var single = options.single === false ? false : true;
            if (single && oSingleDialog) {
				oSingleDialog.close();
			}
			//dialog参数
            var param = $.extend({
                className: 'tui_clean_dialog tui_bubble_dialog',
                hasMask: false,
                isFixed: false,
                hasDrag: false
            }, options.dialogParam);
            param.className += ' tui_stick_' + self.position;
            
			//创建dialog
            var oDialog = new Dialog(param);
			oDialog.bind('close', function(){
				$(window).unbind('resize', self.locate);
			})
			self.dialog = oDialog;
            if (single) {
                oSingleDialog = oDialog;
            }
			
			//定位dialog
			$(window).bind('resize', {
				obj: self
			}, self.locate);
			self.locate();
        },
		locate: function(e){
			e = e || {};
			e.data = e.data || {};
			var self = e.data.obj || this;
			var $dialog = self.dialog.element;
			Stick(self.targetNode, $dialog, self.position);
			$dialog.css({
				left: parseInt($dialog.css('left')) + self.left,
				top: parseInt($dialog.css('top')) + self.top
			});
		},
		close: function(){
            var self = this;
            self.dialog.close();
		}
    });
    Klass.close = function(){
        if (oSingleDialog) {
            oSingleDialog.close();
        }
    };
    Klass.getDialog = function(){
        return oSingleDialog;
    }
	return Klass;
});

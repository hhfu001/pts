define('tui/edittextarea', ['tui/class'], function(Class) {
	var Klass = Class({
		initialize: function(ta) {
			if($.type(ta) == 'string')
				ta = $(ta);
			this.ta1 = ta;
			},
			getCursor: function() {
				var el = this.ta1[0];
				if(!document.selection)
					return el.selectionStart;
				var r = document.selection.createRange(),
					tr = document.body.createTextRange();
				tr.moveToElementText(el);
				for(var i = 0; tr.compareEndPoints("StartToStart", r) < 0; i ++)
					tr.moveStart("character", 1);
				return i;	
			},
			getSelection: function() {
				var el = this.ta[0],
					start,
					end,
					text;
				if(!document.selection) {
					start = el.selectionStart;
					end = el.selectionEnd;
					return {
						start: start,
						end: end,
						text: el.value.substring(start, end)
					};
				}
				var r = document.selection.createRange(),
					tr = document.body.createTextRange();
				tr.moveToElementText(el);
				text = r.text;
				if(!text)
					return { start: 0, end: 0, text: '' };
				for(start = 0; tr.compareEndPoints("StartToStart", r) < 0; start ++)
					tr.moveStart("character", 1);
				return {
					start: start,
					end: start + text.length,
					text: text
				};
			},
			setCursor: function(start, end) {
				var el = this.ta1[0];
				start = start || 0;
				end = end || start;
				try {
					if(el.setSelectionRange) {
						el.focus();
						el.setSelectionRange(start, end);
					}
					else if(el.createTextRange) {
						range = el.createTextRange();
						range.collapse(true);
						range.moveEnd("character", end);
						range.moveStart("character", start);
						range.select();
					}
				} catch(e) {};		
			},
			insert: function(txt, pos) {
				var el = this.ta1[0],
					val = this.ta1.val();
				pos = pos !== undefined ? pos : this.getCursor(el);
				if(pos === undefined)
					pos = val.length;
				el.focus();
				if(!document.selection) {
					this.ta1.val(val.substr(0, pos) + txt + val.substr(pos, val.length - pos));
					this.setCursor(pos + txt.length);
				}
				else {
					var r = document.selection.createRange();
					r.text = txt;
				}
			}
		});
	return Klass;
});

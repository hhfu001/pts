define('tui/form-serialize', function(require, exports){
	/**
	 * 将form中的数据转为Object
	 */
	function serializeMap(form){
		var arr = $(form).serializeArray();
		var o = {};
		arr.forEach(function(item, i){
			var name = item.name;
			var value = item.value;
			if(!(name in o)){
				o[name] = value;
			}else{
				if(!$.isArray(o[name])){
					o[name] = [o[name]];
				}
				o[name].push(value);
			}
		});
		return o;
	}
	exports.serializeMap = serializeMap;
});

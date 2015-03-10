define('tui/pinyin-search', ['tui/event', 'tui/pinyin-map'], function(Event, PinyinMap){
	var toPinyin = (function(){
		var data = PinyinMap;
	
	    //建立高速索引缓存
		var cache = {}, hans, i, j, m;
	    for (var i in data) {
	        hans = data[i];
			j = 0;
			m = hans.length;
	        for(; j < m; j ++) {
	            var han = hans.charAt(j);
	            if (!cache[han]) {
	                cache[han] = [];
	            };
	            cache[han].push(i);
	        };
	    };
	    data = null;
		
	    return function (keyword) {
	        var len = keyword.length, py, i, y;
            if (len === 0) {
                return '';
            };
	        if (len === 1) {
	            y = cache[keyword];
                return y && y[0] ? y[0] : keyword
	        } else {
	            var py = [];
	            for (i = 0; i < len; i ++) {
	                y = cache[keyword.charAt(i)];
	                if (y) {
	                    py[py.length] = y[0];
	                } else {
	                    py[py.length] = keyword.charAt(i);
	                };
	            };
                return py.join('').toLowerCase();
	        };
	    };
	})()
	
    var Klass = Event.extend({
        initialize: function(){
            Klass.superClass.initialize.apply(this, arguments);
			this.resetCache();
        },
        search: function(keyword, callback){
            var cache = this._cache;
            var history = this._history;
            var value = [];
            
            keyword = keyword.toLowerCase();
            callback = callback || function(){};
            
            // 在上一次搜索结果中查询
            if (history.value.length && keyword.indexOf(history.keyword) != -1) {
                cache = history.value;
            }
            
            for (var i = 0, len = cache.length; i < len; i++) {
                if (cache[i].tags.indexOf(keyword) !== -1) {
                    value.push(cache[i]);
                    callback(cache[i].content);
                }
            };
            // 缓存本次查询结果
            this._history = {
                keyword: keyword,
                value: value
            };
            
            return value;
        },
        setCache: function(key, content){
            var obj = {
                tags: toPinyin(key),
                content: content
            };
            this._cache.push(obj);
        },
        resetCache: function(){
            this._cache = [];
            this._history = {
                keyword: '',
                value: []
            };
        }
    });
    return Klass;
});

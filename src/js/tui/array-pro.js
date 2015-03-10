define('tui/array-pro', ['tui/class'], function(Class) {
	function isNil(obj) {
		var is_nil = true;
		for (var d in obj) {
			if (obj[d]) {
				is_nil = false;
				break;
			}
		}
		return is_nil;
	}
    var Klass = Class({
        initialize: function(key){
            this.key = key;
            this.json = {};
            this.array = [];
        },
		get: function(id, iskey) {
			var json = this.json;
			var array = this.array;
			if (id != undefined) {
				return iskey
					? (json[id] || null) && json[id].data
					: (array[id] || null) && array[id];
			} else {
				return array;
			}
		},
		set: function(obj, id, iskey) {
            var json = this.json;
            var array = this.array;
            if (id == undefined) return;
            var data = this.get(id, iskey);
            if (data) {
                for (var d in obj) {
                    if (d == this.key) 
                        break;
                    data[d] = obj[d];
                }
            }
		},
		slice: function(){
			var array = this.array;
			return Array.prototype.slice.apply(array, arguments)
		},
		index: function(id) {
			var json = this.json;
			this.update();
			return json[id] ? json[id].index : -1;
		},
		update: function() {
			var array = this.array;
			var len = array.length;
			// 更新数据项索引值
            for (var i = 0; i < len; i++) {
                this.json[array[i][this.key]].index = i;
            }
		},
		length: function() {
			// 返回数据项个数
			return this.array.length;
		},
		append: function(obj) {
			var json = this.json;
			var array = this.array;
			if (isNil(obj)) return this;
			// 指定标志数据唯一的键名
			var _key = obj[this.key];
			// 填充新数据及其索引值
			if (!json[_key]) {
				json[_key] = { data: obj, index: array.length };
				array.push(obj);
			}
			return this;
		},
		unshift: function(obj) {
			var json = this.json;
			var array = this.array;
			if (isNil(obj)) return this;
			// 指定标志数据唯一的键名
			var _key = obj[this.key];
			// 填充新数据及其索引值
			if (!json[_key]) {
				json[_key] = { data: obj };
				array.unshift(obj);
				this.update();
			}
			return this;
		},
		remove: function(id, iskey) {
			var json = this.json;
			var array = this.array;
			if (id != undefined) {
				// 删除指定项数据
				if (iskey && json[id]) {
					// 删除key值项数据
					var data = json[id].data;
					var index = json[id].index;
					delete(json[id]);
					array.splice(index, 1);
				} else if (array[id]) {
					// 删除索引值项数据
					var data = json[array[id]].data;
					delete(json[array[id]]);
					array.splice(id, 1);
				} else {
					// 无可删除数据 返回空值
					return null;
				}
				this.update();
				// 删除成功 返回被删除数据
				return data;
			} else {
				// 删除全部数据
				this.json = {};
				this.array = [];
			}
		},
		move: function(t, d) {
			if (t > this.array.length - 1) return this;
			// 第t－1项数据移动到第d－1项，其余数据项顺移
			this.array.splice(d, 0, this.array.splice(t, 1)[0]);
			this.update();
			return this;
		},
		reverse: function(){
			this.array.reverse();
			this.update();
		}
    });
	return Klass;
});
/**
模型类，包含Model（key-value data）和Model.List（array data）。

参考项目：
CanJS: http://canjs.com/docs/can.Model.html
Backbone: http://backbonejs.org/#Model
KISSY MVC: http://docs.kissyui.com/docs/html/api/component/mvc/Model.html
NervJS: https://github.com/dexteryy/NervJS/blob/master/nerv.js
*/

define('tui/model', ['tui/event'], function(Event) {

	// 返回一个深层次的副本，递归地复制
	function _copy(data) {
		if (Array.isArray(data)) {
			return $.extend(true, {}, {list : data}).list;
		}
		return $.extend(true, {}, data);
	}

	// 将Model转换成原生对象
	function _toJSON(model) {
		var data = model instanceof List ? [] : {};
		model.each(function(key, val) {
			if (val instanceof List || val instanceof Model) {
				data[key] = _toJSON(val);
			} else {
				data[key] = val;
			}
		});
		return data;
	}

	// 将对象转换成Model
	function _toModel(data, Model, List) {
		var model = Array.isArray(data) ? new List(data) : new Model(data);
		model.each(function(key, val) {
			if (Array.isArray(val) || $.isPlainObject(val)) {
				val = _toModel(val, Model, List);
				model._data[key] = val;
				if (val instanceof List || val instanceof Model) {
					val._parent = model;
				}
			}
		});
		return model;
	}

	// key-value数据类
	var Model = Event.extend({
		// Model类
		model : null,
		// List类
		list : null,
		// 构造方法
		initialize : function(data) {
			var self = this;
			Model.superClass.initialize.call(self);
			self._parent = null;
			data = data ? _copy(data) : {};
			self._data = self.defaults ? $.extend({}, self.defaults, data) : data;
			self.model == null && (self.model = Model);
			self.list == null && (self.list = List);
		},
		// 遍历数据对象
		each : function(fn) {
			var self = this;
			$.each(self._data, fn);
			return self;
		},
		// 根据value查找key
		key : function(val) {
			var key;
			this.each(function(k, v){
				if (v === val) {
					key = k;
					return false;
				}
			});
			return key;
		},
		// 获取key的值。
		get : function(key) {
			if (key === undefined) {
				return this._data;
			}
			return this._data[key];
		},
		// 返回原生对象。
		toJSON : function() {
			return _toJSON(this);
		},
		// 添加或更新属性。
		set : function(key, val) {
			var self = this;
			if (typeof key == 'object') {
				$.each(key, function(k, v) {
					self._set(k, v);
				});
			} else {
				self._set(key, val);
			}
			return self._bindChangeEvent();
		},
		// 替换所有数据。
		replace : function(data) {
			return this._replace(data);
		},
		// 删除一个属性，没有key参数时清空数据对象。
		remove : function(key) {
			var self = this;
			// remove all
			if (key === undefined) {
				if (self._parent) {
					self._parent.remove(self._parent.key(self));
				}
				self._data = Array.isArray(self._data) ? [] : {};
				if (self._parent) {
					self.trigger('change', []);
				} else {
					self._bindChangeEvent();
				}
				return self;
			}
			// remove one
			var prevVal = self.get(key);
			if (Array.isArray(self._data)) {
				self._data.splice(key, 1);
			} else {
				delete self._data[key];
			}
			self._bindEvent('remove', key, prevVal);
			return self._bindChangeEvent();
		},
		toModel : function(data) {
			return this._toModel(data);
		},
		// 添加或更新一个属性
		_set : function(key, val) {
			var self = this;
			var type = self.get(key) === undefined ? 'add' : 'update';
			var prevVal = self.get(key);
			var val = self._toModel(val);
			if (val === prevVal) return;
			self._data[key] = val;
			return self._bindEvent(type, key, val, prevVal);
		},
		// 替换所有数据
		_replace : function(data, concat) {
			var self = this;
			var size, type;

			var updateModelData = []; // 更新后的model数据

			if (concat) {
				size = self.size();
				type = 'concat';
			} else {
				size = 0;
				type = 'replace';
				self._data = Array.isArray(self._data) ? [] : {};
			}
			$.each(data, function(key, val) {
				updateModelData.push(self._data[size + key] = self._toModel(val));
			});
			setTimeout(function(){
				self.trigger(type, [data, updateModelData]);
			}, 0);
			return self._bindChangeEvent();
		},
		// 将对象内部的Object和Array转换成Model
		_toModel : function(data) {
			var self = this;
			if (Array.isArray(data) || $.isPlainObject(data)) {
				data = _toModel(data, self.model, self.list);
			}
			if (data instanceof List || data instanceof Model) {
				data._parent = self;
			}
			return data;
		},
		// 绑定change事件，传播到父数据
		_bindChangeEvent : function() {
			var self = this;
			self.trigger('change', []);
			if (self._parent) {
				self._parent._bindChangeEvent();
			}
			return self;
		},
		// 绑定update事件，传播到父数据
		_bindUpdateEvent : function(val) {
			var self = this;
			self.trigger('update', [self.key(val), val]);
			if (self._parent) {
				self._parent._bindUpdateEvent(self);
			}
			return self;
		},
		// 绑定add/update/remove事件，update事件传播到父数据
		_bindEvent : function(type, key) {
			var self = this;
			var params = $.makeArray(arguments).slice(2);
			self.trigger(type + ':' + key, params);
			self.trigger('change:' + key, params);
			self.trigger(type, [key].concat(params));
			if (self._parent) {
				self._parent._bindUpdateEvent(self);
			}
			return self;
		}
	});

	// 数组类
	var List = Model.extend({
		// 构造方法
		initialize : function(data) {
			var self = this;
			List.superClass.initialize.call(self);
			self._data = data ? _copy(data): [];
		},
		// 获取数组长度
		size : function() {
			return this._data.length;
		},
		// 获取第一个元素
		first : function() {
			return this._data[0];
		},
		// 获取最后一个元素
		last : function() {
			return this._data[this.size() - 1];
		},
		// 根据条件搜索
		where : function(attributes, strict) {
			var self = this;
			var list = [];
			self.each(function(index, val) {
				var match = 0;
				var total = 0;
				$.each(attributes, function(k, v) {
					if (strict && val.get(k) === v || !strict && val.get(k) == v) {
						match++;
					}
					total++;
				});
				if (match === total) {
					list.push(val);
				}
			});
			return list;
		},
		// 将数据添加到数组尾部
		push : function(val) {
			return this._insert(this.size(), val, 'push');
		},
		// 将数据添加到数组头部
		unshift : function(val) {
			return this._insert(0, val, 'unshift');
		},
		// 插入一个数据
		insert : function(index, val) {
			return this._insert(index, val, 'insert');
		},
		// 将多个数据添加到数组尾部
		concat : function(data) {
			return this._replace(data, true);
		},
		// 删除最后一个数据
		pop : function() {
			return this.remove(this.size() - 1);
		},
		// 删除第一个数据
		shift : function() {
			return this.remove(0);
		},
		// 排序
		sort : function(sortFunc) {
			this._data.sort(sortFunc);
			return this._bindChangeEvent();
		},
		// 插入一条数据
		_insert : function(key, val, eventType) {
			var self = this;
			self._data.splice(key, 0, undefined);
			self._set(key, val);
			self.trigger(eventType, [key, val]);
			return self._bindChangeEvent();
		}
	});

	Model.List = List;

	return Model;
});


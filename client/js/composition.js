kampfer.require('events.EventTarget');

kampfer.provide('mindMap.Composition');

kampfer.mindMap.Composition = kampfer.events.EventTarget.extend({
	
	//init : function() {},
	
	//Composition实例
	_parent : null,
	
	//对象，每一项都应该是Composition实例
	_children : null,
	
	_id : null,
	
	setId : function(id) {
		var oldId = this._id;
		
		this._id = id;
		
		if(this._parent && this._parent._children) {
			this._parent._children[oldId] = null;
			this._parent.addChild(this);
		}
	},
	
	getId : function() {
		return this._id || ( this._id = this.generateUniqueId() );
	},
	
	/**
	 * 设置父对象。不能将parent设置为composition自己。
	 * 当composition已经拥有parent时，调用setParent会报错。
	 * composition通过addChild维护父子关系，不能在setParent中也处理父子关系，这样会导致无限循环。
	 * @param	{kampfer.mindMap.Composition}parent
	 */
	setParent : function(parent) {
		if( !(parent instanceof kampfer.mindMap.Composition) ) {
			throw('parent is not instanceof composition');
		}
		
		if(parent === this) {
			throw('parent cant be composition itself');
		}
		
		if(this._parent) {
			throw('parent already exist');
		}
		
		this.setParentEventTarget(parent);
		this._parent = parent;
	},
	
	getParent : function() {
		return this._parent;
	},
	
	/**
	 * 添加子对象。
 	 * @param {kampfer.mindMap.Composition} child
	 */
	addChild : function(child) {
		
		if( !(child instanceof kampfer.mindMap.Composition) ) {
			throw('wrong type param');
		}
		
		var id = child.getId();
	
		if(!this._children) {
			this._children = {};
		}
		
		if(!this._children[id]) {
			this._children[id] = child;
		}else{
			throw('can not add child');
		}
		
		child.setParent(this);
	},
	
	/**
	 * 删除子对象
 	 * @param {string|kampfer.mindMap.Composition} child
	 */
	removeChild : function(child) {
		if(child) {
			var id = kampfer.type(child) === 'string' ? child : child.getId();
			delete this._children[id];
			child.setParent(null);
		}
		
		return child;
	},
	
	//composition只负责子component
	getChild : function(id) {
		if(this._children) {
			return this._children[id];
		}
	},
	
	//fn(value, key)
	eachChild : function(fn, context) {
		if(this._children) {
			for(var id in this._children) {
				if( fn.call(context, this._children[id], id) === false ) {
					return;
				}
			}
		}
	},
	
	/*
	 * 生成唯一id
	 * 直接使用时间戳不可行
	 * 以下方法摘自http://www.cnblogs.com/NoRoad/archive/2010/03/12/1684759.html
	 */
	generateUniqueId : function() {
		var guid = "";
		for(var i = 1; i <= 32; i++) {
			var n = Math.floor(Math.random() * 16.0).toString(16);
			guid += n;
			if((i == 8) || (i == 12) || (i == 16) || (i == 20)) {
				guid += "-";
			}
		}
		return guid;
	},
	
	dispose : function() {
		this._super();
		this._parent = null;
		this._children = null;
	}
	
});

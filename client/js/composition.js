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
		return this._id;
	},
	
	/**
	 * 设置父对象。
	 * @param	{kampfer.mindMap.Composition}parent
	 */
	setParent : function(parent) {
		if(parent === this) {
			return;
		}
		this.setParentEventTarget(parent);
		this._parent = parent;
	},
	
	getParent : function() {
		return this._parent;
	},
	
	/**
	 * 添加子对象
 	 * @param {kampfer.mindMap.Composition} child
	 */
	addChild : function(child) {
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
	
	dispose : function() {
		this._super();
		this._parent = null;
		this._children = null;
	}
	
});

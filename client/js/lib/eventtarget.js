kampfer.require('events');
kampfer.require('Class');

kampfer.provide('events.EventTarget');

/*
 * 所有需要实现自定义事件的类都必须继承EventTarget类。原因如下：
 * 1.EventTarget类定义了getParentEventTarget接口，保证自定义事件能正常冒泡。
 * 2.EventTarget类定义了dispose接口，用来删除引用，释放内存。
 */

kampfer.events.EventTarget = kampfer.Class.extend({
	
	//init : function() {},
	
	_parentEventTarget : null,
	
	addEvent : function(type, handler, scope) {
		return k.events.addEvent(this, type, handler, scope);
	},
	
	//TODO k.events.removeEvent暂时无法通过handler删除事件
	//removeEvent : function(type, handler, scope) {
	//	k.events.removeEvent(this, type, handler, scope);
	//},
	
	removeEventByKey : function(type, key) {
		k.events.removeEventByKey(this, type, key);
	},
	
	fireEvent : function(type, data) {
		k.events.fireEvent(this, type, data);
	},
	
	getParentEventTarget : function() {
		return this._parentEventTarget;
	},
	
	setParentEventTarget : function(obj) {
		this._parentEventTarget = obj;
	},
	
	dispose : function() {
		this._parentEventTarget = null;
		//TODO removeEvent方法暂时无法删除所有事件
		k.events.removeEvent(this);
	}
	
});

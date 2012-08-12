kampfer.require('dataManager');

kampfer.provide('events');
kampfer.provide('events.Event');

kampfer.events.Event = function() {};

kampfer.events.HandlerObj = function(handler, type, scope) {
	this.handelr = handler;
	this.type = type;
	this.scope = scope;
	this.key = kampfer.events.HandlerObj.key++;
};

kampfer.events.HandlerObj.key = 0;

/*
 * 添加事件
 * @param {object}elem
 * @param {string}type
 * @param {function}handler
 * @param {object}scope
 * @TODO 支持捕获?
 */
kampfer.events.addEvent = function(elem, type, handler, scope) {
	var elemData;
	
	//过滤异常情况，取得elem原始数据
	if( elem.nodeType === 3 || elem.nodeType === 8 || !type ||
		!fn || !(elemData = kampfer.dataManager._data(elem)) ) {
		return;
	}
	
	//检查并保存events引用
	if(!elemData.events) {
		elemData.events = {};
	}
	events = elemData.events;
	
	var handlerObj = new kampfer.events.HandlerObj(handler);
	
	var proxy;
	
	if(elem.addEventListener) {
		elem.addEventListener(type, proxy, false);
	} else if(elem.attachEvent) {
		elem.attachEvent("on" + type, proxy);
	}
	
};

kampfer.events.removeEvent = function() {};

kampfer.events.fireEvent = function() {};
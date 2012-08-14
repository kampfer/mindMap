/*global kampfer*/
kampfer.require('dataManager');

kampfer.provide('events');
kampfer.provide('events.Event');

kampfer.events.Event = function(src) {
	this.src = src;
	this.type = src.type;
};

kampfer.events.HandlerObj = function(handler, type, scope) {
	this.handler = handler;
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
	var elemData, events, handlers;
	
	//过滤异常情况，取得elem原始数据
	if( elem.nodeType === 3 || elem.nodeType === 8 || !type ||
		!handler || !(elemData = kampfer.dataManager._data(elem)) ) {
		return;
	}
	
	//检查并保存events引用
	if(!elemData.events) {
		elemData.events = {};
	}
	events = elemData.events;
	
	//用户需要的处理操作
	var handlerObj = new kampfer.events.HandlerObj(handler, type, scope);
	
	//被绑定的操作
	var proxy = kampfer.events.getProxy();
	proxy.srcElement = elem;
	
	//保存handlers数组
	handlers = events[type];
	if(!handlers) {
		events[type] = handlers = [];
		if(elem.addEventListener) {
			elem.addEventListener(type, proxy, false);
		} else if(elem.attachEvent) {
			elem.attachEvent("on" + type, proxy);
		}
	}
	
	//将用户操作保存
	handlers.push(handlerObj);
	
};

kampfer.events.removeEvent = function() {};

kampfer.events.fireEvent = function() {};

kampfer.events.getProxy = function() {
	return function proxy(event) {
		return kampfer.events.proxy.call(proxy.srcElement, event);
	};
};

kampfer.events.proxy = function(event) {
	//生成一个新的event对象
	var eventObj = new kampfer.events.Event(event);
	
	return kampfer.events.fireHandlers.call(this, eventObj);
};

kampfer.events.fireHandlers = function(eventObj) {
	var elemData = kampfer.dataManager._data(this) || {},
		handlerObjs = elemData.events[eventObj.type] || [];
		
	for(var i = 0, l = handlerObjs.length; i < l; i++) {
		//如果处理函数返回false，那么禁用默认行为
		var scope = handlerObjs[i].scope || this;
		if(handlerObjs[i].handler.call(scope, eventObj) === false) {
			var ret = false;
		}
	}
	
	return ret;
};
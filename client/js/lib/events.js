/*global kampfer*/
kampfer.require('dataManager');

kampfer.provide('events');
kampfer.provide('events.Event');


/*
 * 包裹浏览器event对象，提供统一的、跨浏览器的接口。
 * 新的对象将包含以下接口：
 * - type	{string}	事件种类
 * - target		{object}	触发事件的对象
 * - relatedTarget	{object}	鼠标事件mouseover和mouseout的修正
 * - currentTarget	{object}	
 * - stopPropagation	{function}	阻止冒泡
 * - preventDefault	{function}	阻止默认行为
 * - dispose	{function}
 * - which	{number}	
 * - pageX/pageY	{number}
 */
kampfer.events.Event = function(src) {
	this.src = src;
	this.type = src.type;
	this.propagationStopped = false;
	this.isDefaultPrevented = false;
	
	//跨越浏览器
	this.fix();
};

//停止冒泡
kampfer.events.Event.prototype.stopPropagation = function() {
	//使用fireEvent触发事件时，需要读取propagationStopped，判断冒泡是否取消。
	this.propagationStopped = true;

	var e = this.src;
	if(e.stopPropagation) {
		e.stopPropagation();
	} else {
		e.cancelBubble = true;
	}
};

//阻止默认行为
kampfer.events.Event.prototype.preventDefault = function() {
	this.isDefaultPrevented = true;
	
	var e = this.src;
	if (e.preventDefault) {
		e.preventDefault();
	} else {
		e.returnValue = false;
	}
};

//处理兼容性问题
kampfer.events.Event.prototype.fix = function() {
	var src = this.src;
	
	this.target = src.target || src.srcElement;
	//如果target不存在，默认设置为document
	if(!this.target) {
		this.target = kampfer.global.document;
	}
	
	//第一次生成event包裹时，初始化currentTarget为target
	this.currentTarget = this.target;
	
	//修复键盘事件
	if( kampfer.events.Event.isKeyEvent(this.type) ) {
		if ( this.which == null ) {
			this.which = src.charCode != null ? src.charCode : src.keyCode;
		}
	//修复鼠标事件
	} else if( kampfer.events.Event.isMouseEvent(this.type) ) {
		var eventDoc = this.target.ownerDocument || document,
			doc = eventDoc.documentElement,
			body = eventDoc.body;
		
		//修复坐标
		if ( this.pageX == null && this.clientX != null ) {
			this.pageX = src.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
			this.pageY = src.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
		}

		// Add relatedTarget, if necessary
		if ( !this.relatedTarget && src.formElement ) {
			this.relatedTarget = src.fromElement === this.target ? src.toElement : src.formElement;
		}

		// Add which for click: 1 === left; 2 === middle; 3 === right
		// Note: button is not normalized, so don't use it
		var button = src.button;
		if ( !this.which && button !== undefined ) {
			this.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
		}
	}
};

//将event包裹中的对象引用全部清除
kampfer.events.Event.prototype.dispose = function() {
	this.src = null;
	this.target = null;
	this.relatedTarget = null;
};

//判断事件是否为键盘事件
kampfer.events.Event.isKeyEvent = function(type) {
	if( kampfer.type(type) !== 'string' ) {
		type = type.type;
	}
	var reg = /^key/;
	return reg.test(type);
};

//判断事件是否为鼠标事件
kampfer.events.Event.isMouseEvent = function(type) {
	if( kampfer.type(type) !== 'string' ) {
		type = type.type;
	}
	var reg = /^(?:mouse|contextmenu)|click/;
	return reg.test(type);
};


/*
 * 生成handler的一个包裹对象，记录一些额外信息，并且生成一个唯一的key值
 * @param {function}handler
 * @param {string}type
 * @param {object}scope
 */
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
 * @param {string||array}type
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
	
	//同时绑定多个事件
	if( kampfer.type(type) === 'array' ) {
		for(var i = 0, l = type.length; i < l; i++) {
			kampfer.events.addEvent(elem, type[i], handler, scope);
		}
		return;
	}
	
	//检查并保存events引用
	if(!elemData.events) {
		elemData.events = {};
	}
	events = elemData.events;
	
	//用户需要的处理操作
	var handlerObj = new kampfer.events.HandlerObj(handler, type, scope);
	
	handlers = events[type];
	//如果handlers不存在，可以断定addEvent是第一次在对象上调用
	if(!handlers) {
		events[type] = handlers = [];
	
		//被绑定的操作
		var proxy = kampfer.events.getProxy();
		proxy.srcElement = elem;
		
		//储存proxy
		if(!events.proxy) {
			events.proxy = {};
		}
		events.proxy[type] = proxy;
		
		if(elem.addEventListener) {
			elem.addEventListener(type, proxy, false);
		} else if(elem.attachEvent) {
			elem.attachEvent("on" + type, proxy);
		}
	}
	
	//将用户操作保存
	handlers.push(handlerObj);
	
	return handlerObj.key;
};


/*
 *	删除事件
 *	@param {object}elem
 * @param {string}type
 */ 
kampfer.events.removeEvent = function(elem, type) {
	
};


/*
 *	通过key来删除事件
 * TODO
 */
kampfer.events.removeEventByKey = function(elem, type, key) {
	var elemData, handlerObjs;
	
	if( arguments.length < 3 ) {
		return;
	}
	
	elemData = kampfer.dataManager._data(elem);
	if(!elemData || !elemData.events || !elemData.events[type]) {
		return;
	}
	
	handlerObjs = elemData.events[type];
	for(var i = 0, l = handlerObjs.length; i < l; i++) {
		var handlerObj = handlerObjs[i];
		if(handlerObj && handlerObj.key === key) {
			handlerObjs.splice(i,1);
		}
	}
	//如果给类事件的所有处理函数都被删除
	if(handlerObjs.length === 0) {
		//解绑proxy函数
		var proxy = elemData.events.proxy[type];
		if(elem.removeEventListener) {
			elem.removeEventListener(type, proxy, false);
		} else if(elem.detachEvent) {
			elem.detachEvent('on' + type, proxy);
		}
		
		//清空缓存
		delete elemData.events[type];
	}
};


/*
 * 触发对象的指定事件
 * @param {object}elem
 * @param {type}type
 * @param {object}data
 * @TODO 使用fireEvent方法是否支持触发浏览器默认事件，比如点击a标签页面会跳转？
 *		jquery支持，而closure不支持
 */
kampfer.events.fireEvent = function(elem, type, data) {
	var elemData, eventObj;
	
	//同时绑定多个事件
	if( kampfer.type(type) === 'array' ) {
		for(var i = 0, l = type.length; i < l; i++) {
			kampfer.events.fireEvent(elem, type[i], data);
		}
		return;
	}
	
	if(elem.nodeType === 3 || elem.nodeType === 8 || !type) {
		return;
	}

	if(!data) {
		eventObj = new kampfer.events.Event({
			type : type,
			target : elem
		});
	} else if ( !(data instanceof kampfer.events.Event) ) {
		eventObj = new kampfer.events.Event({
			type : type,
			target : elem
		});
		kampfer.extend(eventObj, data);
	} else {
		eventObj = data;
		//eventObj.target = elem;
	}
	
	
	//通过parentNode属性向上冒泡
	for(var cur = elem; cur && !eventObj.propagationStopped; cur = cur.parentNode) {
		eventObj.currentTarget = cur;
		kampfer.events._fireHandlers.call(cur, eventObj);
	}

};


kampfer.events.getProxy = function() {
	var proxy = function(event) {
		return kampfer.events.proxy.call(proxy.srcElement, event);
	};
	return proxy;
	//使用下面的方式返回proxy，ie6中无法取到proxy.srcElement
	//return function proxy(event) {
	//	return kampfer.events.proxy.call(proxy.srcElement, event);
	//};
};


kampfer.events.proxy = function(event) {
	event = event || kampfer.global.event;
	//处理event对象
	var eventObj = new kampfer.events.Event(event);
	
	return kampfer.events._fireHandlers.call(this, eventObj);
};


/*
 * 找出为对象储存的事件处理函数并执行
 * @private
 */
kampfer.events._fireHandlers = function(eventObj) {
	var elemData = kampfer.dataManager._data(this);
	if(!elemData.events) {
		return;
	}
	
	var handlerObjs = elemData.events[eventObj.type] || [], ret;
	
	for(var i = 0, l = handlerObjs.length; i < l; i++) {
		var scope = handlerObjs[i].scope || this;
		//如果处理函数返回false，那么禁用默认行为
		if( handlerObjs[i].handler.call(scope, eventObj) === false ) {
			ret = false;
		}
	}
	
	return ret;
};
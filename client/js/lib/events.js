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
		if ( this.pageX == null && src.clientX != null ) {
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

//销毁对象中指向其他对象的引用
kampfer.events.HandlerObj.prototype.dispose = function() {
	this.handler = null;
	this.scope = null;
};

kampfer.events.HandlerObj.key = 0;


/*
 * 添加事件
 * @param {object}elem
 * @param {string||array}type
 * @param {function}handler
 * @param {object}scope
 * TODO 支持捕获?
 */
kampfer.events.addEvent = function(elem, type, handler, scope) {
	var elemData, events, handlers, i, l;
	
	//过滤异常情况，取得elem原始数据
	if( elem.nodeType === 3 || elem.nodeType === 8 || !type ||
		!handler || !(elemData = kampfer.dataManager._data(elem)) ) {
		return;
	}
	
	//同时绑定多个事件
	if( kampfer.type(type) === 'array' ) {
		for(i = 0, l = type.length; i < l; i++) {
			kampfer.events.addEvent(elem, type[i], handler, scope);
		}
		return;
	}
	
	//检查并保存events引用
	if(!elemData.events) {
		elemData.events = {
			_count : 0
		};
	}
	events = elemData.events;
	
	//用户需要的处理操作
	var handlerObj = new kampfer.events.HandlerObj(handler, type, scope);
	
	handlers = events[type];
	//如果handlers不存在，可以断定addEvent是第一次在对象上调用
	if(!handlers) {
		events[type] = handlers = [];
		events._count++;
	
		//被绑定的操作
		var proxy = kampfer.events.getProxy();
		proxy.srcElement = elem;
		
		//储存proxy
		if(!events.proxy) {
			events.proxy = {
				_count : 0
			};
			events._count++;
		}
		events.proxy[type] = proxy;
		events.proxy._count++;
		
		if(elem.addEventListener) {
			//使用代理函数会屏蔽很多浏览器操作
			//TODO 考虑调整代码
			elem.addEventListener(type, proxy, false);
		} else if(elem.attachEvent) {
			elem.attachEvent("on" + type, proxy);
		}
	}
	
	//将用户操作保存
	handlers.push(handlerObj);

	// 192行将elem的引用赋给了proxy.srcElement, 形成了循环引用.
	// 所以这里清空elem.
	elem = null;
	
	return handlerObj.key;
};


/*
 * 删除事件。此方法用于删除绑定在某类事件下的全部操作。
 * @param {object}elem
 * @param {string}type
 * TODO 1.重复调用_data，需要优化
 * 		2.不传递type，就删除所有事件
 */ 
kampfer.events.removeEvent = function(elem, type) {
	var elemData, handlerObjs;
	
	elemData = kampfer.dataManager._data(elem);
	if(!elemData.events || !elemData.events[type]) {
		return;
	}
	
	//清空所有处理函数
	handlerObjs = elemData.events[type];
	//由于removeEventByKey会改变handlerObjs的长度，所以每次读取第一项。
	//避免读取到undefined的情况
	while(handlerObjs[0]) {
		kampfer.events.removeEventByKey(elem, type, handlerObjs[0].key);
	}
	//for(i = 0, l = handlerObjs.length; i < l; i++) {
	//	kampfer.events.removeEventByKey(elem, type, handlerObjs[i].key);
	//}
};


/*
 * 通过key来删除事件
 * TODO 减少需要传递的参数，只需传递key。其他删除方法最终都调用本方法。
 */
kampfer.events.removeEventByKey = function(elem, type, key) {
	var elemData, handlerObjs, i, l;
	
	if( arguments.length < 3 ) {
		return;
	}
	
	elemData = kampfer.dataManager._data(elem);
	if(!elemData || !elemData.events || !elemData.events[type]) {
		return;
	}
	
	handlerObjs = elemData.events[type];
	for(i = 0, l = handlerObjs.length; i < l; i++) {
		var handlerObj = handlerObjs[i];
		if(handlerObj && handlerObj.key === key) {
			handlerObj.dispose();
			//每次删除操作后缓存数组的长度都会-1，而i会+1。由于removeEventByKey方法
			//实际只会执行一次删除操作，所以不会出现handlerObjs[i]不存在的情况。但是
			//当多次重复调用removeEventByKey删除统一对象的相同事件时，就会可能出现
			//handlerObjs[i] === undefined的情况
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
		//删除 到elem的引用 
		elemData.events.proxy[type].srcElement = null;
		elemData.events.proxy[type] = null;
		elemData.events.proxy._count--;
		if(elemData.events.proxy._count === 0) {
			elemData.events.proxy = null;
			elemData.events._count--;
		}
		
		elemData.events[type] = null;
		elemData.events._count--;
		if( elemData.events._count === 0 ) {
			kampfer.dataManager._removeData(elem, 'events');
		}
	}
};


/*
 * 触发对象的指定事件
 * @param {object}elem
 * @param {type}type
 * @param {object}data
 * TODO 使用fireEvent方法是否支持触发浏览器默认事件，比如点击a标签页面会跳转？
 *		jquery支持，而closure不支持
 */
kampfer.events.fireEvent = function(elem, type, data) {
	var elemData, eventObj, i, l, cur;
	
	//同时绑定多个事件
	if( kampfer.type(type) === 'array' ) {
		for(i = 0, l = type.length; i < l; i++) {
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
		eventObj.type = type;
		//target应该是触发事件的对象,不应该被改变
		//eventObj.target = elem;
	}
	
	
	// 通过parentNode属性向上冒泡
	// BUG: 被隐藏的元素的parentNode=null, demo: test/test_parentNode_null.html
	//for(cur = elem; cur && !eventObj.propagationStopped; cur = cur.parentNode) {
	//	eventObj.currentTarget = cur;
	//	kampfer.events._fireHandlers.call(cur, eventObj);
	//}
	
	cur = elem;
	while(cur) {
		eventObj.currentTarget = cur;
		kampfer.events._fireHandlers.call(cur, eventObj);
		//向上传播-冒泡
		if(cur.getParentEventTarget && !cur.nodeType) {
		//处理plain object冒泡
		//plain object事件的冒泡需要plain object实现一个借口getParentEventTarget，
		//这个借口返回plain object的父辈plain object
			cur = cur.getParentEventTarget();
		}else{
		//处理DOM冒泡
		//因为document.parentNode === null，所以当事件冒泡到document时，
		//采取特殊的处理方式将事件冒泡到window
			if(cur === elem.ownerDocument) {
				cur = cur.defaultView || cur.parentWindow || kampfer.global;
			} else {
				cur = cur.parentNode;
			}
		}
	}
};


//取得所有封装后的事件处理对象
kampfer.events.getHandlerObjs = function(elem, type) {
	var events = kampfer.dataManager._data(elem, 'events');
	if(events && events[type]) {
		return events[type];
	}
	return null;
};


//取得单个封装后的事件处理对象
kampfer.events.getHandlerObj = function(elem, type, handler) {
	var handlerObjs = kampfer.events.getHandlerObjs(elem, type),
		i, l;
	if(handlerObjs) {
		for(i = 0, l = handlerObjs.length; i < l; i++) {
			if(handlerObjs[i].handler === handler) {
				return handlerObjs[i];
			}
		}
	}
	return null;
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
	var elemData = kampfer.dataManager._data(this),
		i, l;
	
	if(!elemData.events) {
		return;
	}
	
	var handlerObjs = elemData.events[eventObj.type] || [], ret;
	
	for(i = 0, l = handlerObjs.length; i < l; i++) {
		var scope = handlerObjs[i].scope || this;
		//如果处理函数返回false，那么禁用默认行为
		if( handlerObjs[i].handler.call(scope, eventObj) === false ) {
			ret = false;
		}
	}
	
	return ret;
};
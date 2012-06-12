/*global kampfer*/

/**
 * 提供跨浏览器的事件处理机制
 * @module event
 * @author l.w.kampfer@gmail.com
 */

kampfer.require('dataManager');

kampfer.provide('event');

(function( kampfer, window ) {
	
	var rkeyEvent = /^key/,
		rmouseEvent = /^(?:mouse|contextmenu)|click/;
	
	// 自定义的event对象。来源自jQuery。
	// http://www.w3.org/TR/2003/WD-DOM-Level-3-Events-20030331/ecma-script-binding.html
	var Event = function( src, props ) {
		
		if( src && src.type ) {
			this.originalEvent = src;
			this.type = src.type;
			
			// Events bubbling up the document may have been marked as prevented
			// by a handler lower down the tree; reflect the correct value.
			this.isDefaultPrevented = ( src.defaultPrevented || src.returnValue === false ||
				src.getPreventDefault && src.getPreventDefault() ) ? true : false;
		} else {
			this.type = src;
		}
		
		if( props ) {
			kampfer.extend( this, props );
		}
		
		this[kampfer.expando] = true;
		
	};
	
	Event.prototype = {
		
		preventDefault : function() {
			this.isDefaultPrevented = true;
			
			var e = this.originalEvent;
			// 使用trigger方法触发事件时，originalEvent为空
			if( !e ) {
				return;
			}
			
			if ( e.preventDefault ) {
				e.preventDefault();
			} else {
				e.returnValue = false;
			}
		},
		
		stopPropagation : function() {
			this.isPropagationStoriginalEventopped = true;
			
			var e = this.originalEvent;
			// 使用trigger方法触发事件时，originalEvent为空
			if( !e ) {
				return;
			}
			
			if( e.stopPropagation ) {
				e.stopPropagation();
			} else {
				e.cancelBubble = true;
			}
		},
		
		stopImmediatePropagation : function() {
			this.isImmediatePropagationStopped = true;
			this.stopPropagation();
		},
		
		isDefaultPrevented : false,
		
		isPropagationStopped : false,
		
		isImmediatePropagationStopped : false
		
	};
	
	var removeEvent = window.removeEventListener ?
		function( elem, type, fn ) {
			elem.removeEventListener( type, fn, false );
		} :
		function( elem, type, fn ) {
			var name = 'on' + type;
			//preventing memory leaks for custom events in IE6-8 –
			//detachEvent needed property on element, by name of that event, to properly expose it to GC
			if ( typeof elem[ name ] === "undefined" ) {
				elem[ name ] = null;
			}
			elem.detachEvent( name, fn );
		};
	
	kampfer.event = {
		
		eventId : 1,
		
		addEvent : function ( elem, type, fn ) {
		
			var elemData, events, handler, handlerObj, handlers;
			
			if( elem.nodeType === 3 || elem.nodeType === 8 || !type ||
				!fn || !(elemData = kampfer.dataManager._data(elem)) ) {
				return;
			}
			
			if( !fn.eventId ) {
				fn.eventId = kampfer.event.eventId++;
			}
			
			events = elemData.events;
			if( !events ) {
				elemData.events = events = {};
			}
			
			handler = elemData.handler;
			if( !handler ) {
				elemData.handler = handler = function(e) {
					if( typeof kampfer !== 'undefined' && (!e || kampfer.event.triggered !== e.type) ) {
						// 修复ie下this被错误绑定的问题
						return kampfer.event.dispatch.call( handler.elem, e );
					} else {
						return;
					}
				};
				handler.elem = elem;
			}
			
			handlerObj = {
				type : type,
				handler : fn,
				id : fn.eventId
			};
			
			handlers = events[type];
			// 如果缓存中不存在事件分类，才再次绑定事件
			if( !handlers ) {
				events[type] = handlers = [];
				if ( elem.addEventListener ) {
					elem.addEventListener( type, handler, false );
				} else if ( elem.attachEvent ) {
					elem.attachEvent( "on" + type, handler );
				}
			}
			handlers.push( handlerObj );
			
			kampfer.event.global[ type ] = true;
			
			// 避免ie内存泄露
			elem = null;
			
		},
		
		removeEvent : function( elem, type, fn ) {
			
			var elemData = kampfer.dataManager._data( elem ),
				events = elemData.events, 
				arr, handlers, i, l, handler, bindHandler;
			
			if( !events ) {
				return;
			}
			
			if( !type ) {
				for( arr in events ) {
					kampfer.event.removeEvent( elem, arr, fn );
				}
			} else {
				handlers = events[type];
				for( i = 0; i < handlers.length; i++ ) {
					handler = handlers[i];
					if( !fn || (handler.id === fn.eventId) ) {
						handlers.splice( i--, 1 );
					}
				}
				if( handlers.length === 0 ) {
					removeEvent( elem, type, elemData.handler );
					delete events[type];
				}
			}
			
			if( kampfer.isEmptyObject( events ) ) {
				delete elemData.handler;
				kampfer.dataManager._removeData( elem, 'evnets');
			}
			
		},
		
		trigger : function( elem, event ) {
			
			var type = event.type || event,
				onType = 'on' + type,
				eventPath = [],
				cur, old, i, l, handler;
			
			if ( !elem || (elem.nodeType === 3 || elem.nodeType === 8) ) {
				return;
			}
			
			if( !kampfer.event.global[type] ) {
				return;
			}
			
			event = typeof event === 'object' ?
				( event[kampfer.expando] ? event :
				kampfer.event.fixEvent( event) ) :
				kampfer.event.fixEvent( type );
				
			if( !kampfer.isWindow( elem ) ) {
				for( cur = elem; cur; cur = cur.parentNode ) {
					eventPath.push([cur, type]);
					old = cur;
				}
				if ( old && old === elem.ownerDocument ) {
					eventPath.push([ old.defaultView || old.parentWindow || window, type ]);
				}
			}
			
			for( i = 0, l = eventPath.length; i < l; i++ ) {
				cur = eventPath[i][0];
				handler = onType && cur[ onType ];
				if ( handler && handler.apply( cur ) === false ) {
					event.preventDefault();
				}
				handler = (kampfer.dataManager._data( cur, 'events' ) || {})[type] && 
					kampfer.dataManager._data( cur, 'handler' );
				if( handler ) {
					handler.call( cur, event );
				}
			}
			
			if( !event.isDefaultPrevented ) {
				if( onType && elem[type] ) {
					old = elem[onType];
					// 暂时屏蔽通过原生onxxx方法绑定的事件
					if( old ) {
						elem[onType] = null;
					}
					// triggered:避免重复触发kampfer缓存的事件（即dispatch函数）
					kampfer.event.triggered = type;
					
					elem[ type ]();
					
					kampfer.event.triggered = undefined;
					if ( old ) {
						elem[onType] = old;
					}
				}
			}
		},
		
		fixEvent : function(event) {
			
			var originalEvent = event,
				fixHook = this.fixHooks[event.type] || {},
				copy = fixHook.props ? this.props.concat( fixHook.props ) : this.props,
				i, prop;
			
			event = new Event( originalEvent );
			
			for( i = 0; i < copy.length; i ++ ) {
				prop = copy[i];
				event[prop]	 = originalEvent[prop];
			}
			
			if( !event.target ) {
				event.target = originalEvent.srcElement || document;
			}
			
			// Target should not be a text node (Safari)
			if ( event.target.nodeType === 3 ) {
				event.target = event.target.parentNode;
			}
	
			// For mouse/key events; add metaKey if it's not there (IE6/7/8)
			if ( event.metaKey === undefined ) {
				event.metaKey = originalEvent.ctrlKey;
			}
			
			return fixHook.filter ? fixHook.filter( event, originalEvent ) : event;
			
		},
		
		dispatch : function( event ) {
		
			event = kampfer.event.fixEvent( event || window.event );
			
			var handlers = (kampfer.dataManager._data( this, 'events' ) || {})[event.type] || [],
				i, l, fn, ret;
			
			if( handlers.length ) {
				for( i = 0, l = handlers.length; i < l; i++ ) {
					fn = handlers[i].handler;
					ret = fn.call( this, event );
					if( ret === false ) {
						event.stopPropagation();
						event.preventDefault();
					}
				}
			}
			
			return ret;
			
		},
		
		global : {},
		
		fixHooks : {},
		
		// jQuery中将event分成两类：键盘和鼠标。以下属性是两者共有的。
		props: "attrChange attrName relatedNode srcElement altKey bubbles cancelable ctrlKey currentTarget eventPhase metaKey relatedTarget shiftKey target timeStamp view which".split(" "),
		
		// 键盘属性修复(props是要拷贝的原始属性，filter函数修复兼容性问题)
		keyHooks: {
			props: "char charCode key keyCode".split(" "),
			filter: function( event, original ) {
	
				// Add which for key events
				if ( event.which == null ) {
					event.which = original.charCode != null ? original.charCode : original.keyCode;
				}
	
				return event;
			}
		},
		
		// 鼠标属性修复(props是要拷贝的原始属性，filter函数修复兼容性问题)
		mouseHooks: {
			props: "button buttons clientX clientY fromElement offsetX offsetY pageX pageY screenX screenY toElement".split(" "),
			filter: function( event, original ) {
				var eventDoc, doc, body,
					button = original.button,
					fromElement = original.fromElement;
	
				// Calculate pageX/Y if missing and clientX/Y available
				if ( event.pageX == null && original.clientX != null ) {
					eventDoc = event.target.ownerDocument || document;
					doc = eventDoc.documentElement;
					body = eventDoc.body;
	
					event.pageX = original.clientX + ( doc && doc.scrollLeft || body && body.scrollLeft || 0 ) - ( doc && doc.clientLeft || body && body.clientLeft || 0 );
					event.pageY = original.clientY + ( doc && doc.scrollTop  || body && body.scrollTop  || 0 ) - ( doc && doc.clientTop  || body && body.clientTop  || 0 );
				}
	
				// Add relatedTarget, if necessary
				if ( !event.relatedTarget && fromElement ) {
					event.relatedTarget = fromElement === event.target ? original.toElement : fromElement;
				}
	
				// Add which for click: 1 === left; 2 === middle; 3 === right
				// Note: button is not normalized, so don't use it
				if ( !event.which && button !== undefined ) {
					event.which = ( button & 1 ? 1 : ( button & 2 ? 3 : ( button & 4 ? 2 : 0 ) ) );
				}
	
				return event;
			}
		}
		
	};
	
	kampfer.extend({
		addEvent : kampfer.event.addEvent,
		removeEvent : kampfer.event.removeEvent,
		trigger : kampfer.event.trigger
	});
	
	kampfer.each( ("blur focus focusin focusout load resize scroll unload click dblclick " +
		"mousedown mouseup mousemove mouseover mouseout mouseenter mouseleave " +
		"change select submit keydown keypress keyup error contextmenu").split(" "), function( i, name ) {
	
		if ( rkeyEvent.test( name ) ) {
			kampfer.event.fixHooks[ name ] = kampfer.event.keyHooks;
		}
	
		if ( rmouseEvent.test( name ) ) {
			kampfer.event.fixHooks[ name ] = kampfer.event.mouseHooks;
		}
	});
	
})( kampfer, window );
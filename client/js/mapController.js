/*global kampfer console*/
kampfer.require('Class');
kampfer.require('event');
kampfer.require('mindMap.Map');

kampfer.provide('mindMap.MapController');

/*
 * map控制器类
 * 所有的浏览器事件都在这里被注册。view组件订阅mapController的自定义事件
 */
kampfer.mindMap.MapController = kampfer.Class.extend({
	
	init : function(currentMapManager) {
		
		this.currentMapManager = currentMapManager;
		
		//保存一个map视图的引用
		this.map = null;
		
		this.currentState = this.initialState;
		
	},
	
	render : function() {
		if(!this.map) {
			this.map = new kampfer.mindMap.Map(this, this.currentMapManager);
		}
		
		this.map.render();
	},
	
	getNode : function(id) {
		return this.map.getNode(id);
	},

	monitorEvents : function() {
		
		var that = this,
			element = this.map.getElement();
		
		function handleEvent(event) {
			var controller = that;
			
			var func = controller.action2Function[controller.currentState][event.type];
			if(!func) {
				func = controller.action2Function.unexceptedEvent;
			}
			
			controller.currentState = func.call(controller, event);
		}
		
		kampfer.addEvent(element, 'mousedown', handleEvent);
		kampfer.addEvent(element, 'mousemove', handleEvent);
		kampfer.addEvent(element, 'mouseup', handleEvent);
		kampfer.addEvent(element, 'mouseover', handleEvent);
		kampfer.addEvent(element, 'mouseout', handleEvent);
		
	},
	
	action2Function : {
		
		mapActivated : {
			
			mouseover : function(event) {
				if( this.isNodeElement(event.target) ) {
					return 'nodeActivated';
				}
				return 'mapActivated';
			}
			
		},
		
		//鼠标在node上
		nodeActivated : {
			
			mouserout : function() {
				var relatedTarget = event.relatedTarget;
				if( this.isMapElement(relatedTarget) ) {
					return 'mapActivated';
				}
				return 'nodeActivated';
			},
			
			mousedown : function(event) {
				event.preventDefault();
			
				if(event.button === 2) {
					//显示编辑菜单
					kampfer.event.trigger(this, 'showMenu', {
						currentNodeId : this.currentNodeId
					});
					return 'nodeActivated';
				}
				
				if(event.button === 0) {
					this.saveCursorPosition(event);
					return 'nodefocus';
				}
			}
			
		},
		
		//在node上按住鼠标左键
		nodefocus : {
			
			mousemove : function() {
				if( !this.isNodeElement(event.target) ) {
					return 'nodeActivated';
				} else {
					var offsetX = event.pageX - this.lastCursorX,
						offsetY = event.pageY - this.lastCursorY,
						id = this.getCurrentNodeId(event),
						node = this.map.getNode(id);
						
					this.saveCursorPosition(event);
					node.move(offsetX, offsetY);
					
					return 'nodefocus';
				}
			},
			
			mouseup : function() {
				return 'nodeActivated';
			}
			
		},
		
		unexceptedEvent : function() {
			return this.currentState;
		}

	},
	
	initialState : 'mapActivated',
	
	saveCursorPosition : function(event) {
		this.lastCursorX = event.pageX;
		this.lastCursorY = event.pageY;
	},
	
	getCurrentNodeId : function(event) {
		var nodeElement = this.getNodeElement(event.target),
			id = nodeElement.id;
		
		return id;
	},
	
	getNodeElement : function(element) {
		do {
			if( element.getAttribute('node-type') === 'node' ) {
				return element;
			}
			element = element.parentNode;
		}while(element);
		
		return null;
	},
	
	//判断dom是否在一个node中，或者它就是node。
	//但是排除branch的情况
	isNodeElement : function(element) {
		var nodeType;
		
		do {
			nodeType = element.getAttribute('node-type');
			if( nodeType === 'node' ) {
				return true;
			}else if( nodeType === 'branch' ) {
				return false;
			}
			element = element.parentNode;
		}while(element);
		
		return false;
	},
	
	isMapElement : function(element) {
		if( element.getAttribute('node-type') === 'map' ) {
			return true;
		}
		return false;
	},
	
	getCommand : function(event) {
		var element = event.target,
			ret;
			
		while( element && !(ret = element.getAttribute('action')) ) {
			element = element.parentNode;
		}
		
		if(!ret) {
			throw 'err';
		}
		
		return ret;
	}
	
});
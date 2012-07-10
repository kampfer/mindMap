/*global window kampfer console*/
kampfer.require('Class');
kampfer.require('event');
kampfer.require('mindMap.Map');
kampfer.require('mindMap.Menu');

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
		
		if(!this.map) {
			this.map = new kampfer.mindMap.Map(this, this.currentMapManager);
		}
		
		this.menu = new kampfer.mindMap.Menu();
		this.menu.addItem( new kampfer.mindMap.MenuItem('test', function(){
			alert(kampfer);
		}) );
		this.menu.addItem( new kampfer.mindMap.MenuItem('test1') );
		this.menu.addItem( new kampfer.mindMap.MenuItem('test2') );
		this.menu.addItem( new kampfer.mindMap.MenuItem('test3') );
		this.menu.addItem( new kampfer.mindMap.MenuItem('test4111111111111111111111111') );
		
	},
	
	render : function() {
		this.map.render();
		this.menu.render();
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
			},
			
			mousedown : function(event) {
				event.preventDefault();
				
				if(event.button === 0) {
					this.saveCursorPosition(event);
					return 'mapFocus';
				}
				
				return 'mapActivated';
			}
			
		},
		
		mapFocus : {
			
			mousemove : function(event) {
				var offsetX = event.pageX - this.lastCursorX,
					offsetY = event.pageY - this.lastCursorY;
				
				this.saveCursorPosition(event);
				this.map.move(offsetX, offsetY);
				
				return 'mapFocus';
			},
			
			mouseup : function() {
				return 'mapActivated';
			}
			
		},
		
		//鼠标在node上
		nodeActivated : {
			
			mouseout : function(event) {
				if( this.isNodeElement(event.target) ) {
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
			
			mousemove : function(event) {
				if( !this.isNodeElement(event.target) ) {
					return 'nodeActivated';
				} else {
					var offsetX = event.pageX - this.lastCursorX,
						offsetY = event.pageY - this.lastCursorY,
						id = this.getCurrentNodeId(event),
						node = this.map.getNode(id);
						
					this.saveCursorPosition(event);
					//TODO node移动太快时会出现丢失焦点的情况，需要提高移动动画的效率。
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
		}while(element && element.getAttribute);
		
		return null;
	},
	
	//判断dom是否在一个node中，或者它就是node。
	//但是排除branch的情况
	isNodeElement : function(element) {
		var nodeType;
		
		while(element && element.getAttribute) {
			nodeType = element.getAttribute('node-type');
			if( nodeType === 'node' ) {
				return true;
			}else if( nodeType === 'branch' ) {
				return false;
			}
			element = element.parentNode;
		}
		
		return false;
	}
	
});
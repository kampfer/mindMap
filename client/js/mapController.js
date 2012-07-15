/*global window kampfer console*/
kampfer.require('Class');
kampfer.require('event');
kampfer.require('mindMap.Map');
kampfer.require('mindMap.Node');
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
		
		this.currentNode = null;
		
		if(!this.map) {
			this.map = new kampfer.mindMap.Map(this, this.currentMapManager);
		}
		
		var that = this;
		this.menu = new kampfer.mindMap.Menu();
		this.menu.addItem( new kampfer.mindMap.MenuItem('添加新节点', function() {
			var data = that.currentMapManager.createNode( that.currentNode.getId() );
			that.currentNode.addChild( 
				new kampfer.mindMap.Node(data, that, that.currentMapManager), true );
		}) );
		this.menu.addItem( new kampfer.mindMap.MenuItem('编辑', function() {
			that.currentNode.getCaption().insertTextarea();
		}) );
		this.menu.addItem( new kampfer.mindMap.MenuItem('test2') );
		this.menu.addItem( new kampfer.mindMap.MenuItem('test3') );
		this.menu.addItem( new kampfer.mindMap.MenuItem('test4') );
		
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
				var node = this.getNodeFromElement(event.target);
				if( node ) {
					this.currentNode = node;
					return 'nodeActivated';
				}
				return 'mapActivated';
			},
			
			mousedown : function(event) {
				event.preventDefault();
				
				if(event.button === 0) {
					this.menu.hide();
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
					this.menu.setPosition(event.pageX, event.pageY);
					this.menu.show();
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
						node = this.getNodeFromElement(event.target);
						
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
		var nodeElement = this.getNodeFromElement(event.target),
			id = nodeElement.id;
		
		return id;
	},
	
	getNodeFromElement : function(element) {
		var nodeType;
		
		while(element && element.getAttribute) {
			nodeType = element.getAttribute('node-type');
			if(nodeType === 'node') {
				return this.getNode(element.id);
			}else if( nodeType === 'branch' ) {
				return null;
			}
			element = element.parentNode;
		}
		
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
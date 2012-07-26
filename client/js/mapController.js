/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('event');
kampfer.require('mindMap.Map');
kampfer.require('mindMap.Node');
kampfer.require('mindMap.Menu');
kampfer.require('mindMap.commandManager');

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
		
		//TODO 将menu与mapController解耦
		this.menuForNode = new kampfer.mindMap.Menu();
		this.menuForNode.addItem( new kampfer.mindMap.MenuItem('添加新节点', function() {
			var data = that.currentMapManager.createNode( that.currentNode.getId() );
			that.currentNode.addChild( 
				new kampfer.mindMap.Node(data, that, that.currentMapManager), true );
		}) );
		this.menuForNode.addItem( new kampfer.mindMap.MenuItem('编辑', function() {
			that.currentState = 'nodeEditing';
			that.currentNode.getCaption().insertTextarea();
		}) );
		this.menuForNode.addItem( new kampfer.mindMap.MenuItem('删除', function() {
			var parent = that.currentNode.getParent(),
				id = that.currentNode.getId();
			that.currentMapManager.deleteNode(id);
			parent.removeChild(that.currentNode);
		}) );
		
		this.menuForMap = new kampfer.mindMap.Menu();
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('保存', function(){
			var data = JSON.stringify( that.currentMapManager.getData() );
			console.log(data);
			localStorage.aMap = data;
		}) );
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('undo', function(){
			kampfer.mindMap.commandManager.undo(1);
		}) );
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('redo', function(){
			kampfer.mindMap.commandManager.redo(1);
		}) );
		
	},
	
	render : function() {
		this.map.render();
		this.menuForNode.render();
		this.menuForMap.render();
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
				this.menuForNode.hide();
				
				if(event.button === 0) {
					this.menuForMap.hide();
					this.saveCursorPosition(event);
					return 'mapFocus';
				}
				
				if(event.button === 2) {
					this.menuForMap.setPosition(event.pageX, event.pageY);
					this.menuForMap.show();
				}
				
				return 'mapActivated';
			}
			
		},
		
		mapFocus : {
			
			mousemove : function(event) {
				var offsetX = event.pageX - this.lastPageX,
					offsetY = event.pageY - this.lastPageY;
				
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
				this.menuForNode.hide();
				this.menuForMap.hide();
				
				if(event.button === 2) {	
					this.menuForNode.setPosition(event.pageX, event.pageY);
					this.menuForNode.show();
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
				var offsetX = event.pageX - this.lastCursorX,
					offsetY = event.pageY - this.lastCursorY,
					node = this.currentNode;
			
				node.moveTo(offsetX, offsetY);
				
				return 'nodefocus';
			},
			
			mouseup : function() {
				var position = this.currentNode.getPosition();
				//this.currentMapManager.setNodePosition(this.currentNode.getId(),
				//	position.left, position.top);
				var command = new kampfer.mindMap.commandManager.saveNodePositionCommand(
					this.currentNode, this.currentMapManager, position);
				command.execute();
				kampfer.mindMap.commandManager.addCommand(command);
				return 'nodeActivated';
			}
			
		},
		
		nodeEditing : {
			mousedown : function(event) {
				if( !this.isTextEditor(event.target) ) {
					this.currentNode.getCaption().insertText();
					this.currentMapManager.setNodeContent(this.currentNode.getId(),
						this.currentNode.getCaption().getContent());
					return 'mapActivated';
				}
				return 'nodeEditing';
			}
		},
		
		unexceptedEvent : function() {
			return this.currentState;
		}

	},
	
	initialState : 'mapActivated',
	
	saveCursorPosition : function(event) {
		var position = this.currentNode.getPosition();
		this.lastPageX = event.pageX;
		this.lastPageY = event.pageY;
		this.lastCursorX = event.pageX - position.left;
		this.lastCursorY = event.pageY - position.top;
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
	},
	
	isMapElement : function(element) {
		var attr = element.getAttribute('node-type');
		if(attr && attr === 'map') {
			return true;
		}
		return false;
	},
	
	isTextEditor : function(element) {
		var attr = element.getAttribute('node-type');
		if(attr && attr === 'editor') {
			return true;
		}
		return false;
	}
	
});
/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('events');
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
	
	init : function(currentMapManager, localStore) {
		
		this.currentMapManager = currentMapManager;
		
		this.currentState = this.initialState;
		
		this.map = new kampfer.mindMap.Map(this, this.currentMapManager);
		
		this.currentNode = this.map;
		
		this.menuForMap = new kampfer.mindMap.Menu(this, currentMapManager);
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('create node') );
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('save') );
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('redo') );
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('undo') );
		var createNewNodeCommand = new kampfer.mindMap.command.createNewNode(this.menuForMap);
		//var saveDocumentCommand = new kampfer.mindMap.command.saveMap(this.menuForMap);
		//var redoCommand = new kampfer.mindMap.command.redo(this.menuForMap);
		//var undoCommand = new kampfer.mindMap.command.undo(this.menuForMap);
		
		this.menuForNode = new kampfer.mindMap.Menu();
	},
	
	render : function() {
		this.map.render();
		this.menuForNode.render();
		this.menuForMap.render();
		
		if( this.map.hasNoChild() ) {
			var newNode = this.createNode(),
				rect = this.map.getChild(newNode.id).getSize();
			this.saveNodePosition(newNode.id, 1000 - rect.width / 2, 1000 - rect.height / 2);
		}
	},
	
	getNode : function(id) {
		if(id === 'map') {
			return this.map;
		}
		return this.map.getNode(id);
	},
	
	getNodeData : function(id) {
		return this.currentMapManager.getNode(id);
	},

	monitorEvents : function() {
		
		var element = this.map.getElement();
		
		function handleEvent(event) {
			var controller = this;
			
			var func = controller.action2Function[controller.currentState][event.type];
			if(!func) {
				func = controller.action2Function.unexceptedEvent;
			}
			
			controller.currentState = func.call(controller, event);
		}
		
		kampfer.events.addEvent(element, ['mousedown', 'mousemove', 'mouseup', 
			'mouseover', 'mouseout'], handleEvent, this);
		
	},
	
	action2Function : {
		
		mapActivated : {
			
			mouseover : function(event) {
				var node = this.getNodeFromElement(event.target);
				if( node ) {
					return 'nodeActivated';
				}
				return 'mapActivated';
			},
			
			mousedown : function(event) {
				this.menuForNode.hide();
				
				if(event.which === 0) {
					this.menuForMap.hide();
					this.saveCursorPosition(event);
					return 'mapFocus';
				}
				
				if(event.which === 3) {
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
				
				var node = this.getNodeFromElement(event.target);
				this.currentNode = node;
				
				if(event.which === 3) {	
					this.menuForNode.setPosition(event.pageX, event.pageY);
					this.menuForNode.show();
					return 'nodeActivated';
				}
				
				if(event.which === 0) {
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
				var command = new kampfer.mindMap.commandManager.saveNodePositionCommand(
					this.currentNode.getId(), position, this);
				kampfer.mindMap.commandManager.addCommand(command);
				command.execute();
				return 'nodeActivated';
			}
			
		},
		
		nodeEditing : {
			mousedown : function(event) {
				if( !this.isTextEditor(event.target) ) {
					var command = new kampfer.mindMap.commandManager.saveNodeContentCommand(
						this.currentNode.getId(), this.currentNode.getCaption().insertText(), this);
					kampfer.mindMap.commandManager.addCommand(command);
					command.execute();
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
		var cur = this.currentNode || this.map;
		var position = cur.getPosition();
		this.lastPageX = event.pageX;
		this.lastPageY = event.pageY;
		this.lastCursorX = event.pageX - position.left;
		this.lastCursorY = event.pageY - position.top;
	},
	
	//TODO 删除
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
	
	//TODO 删除
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
	},
	
	saveNodeContent : function(id, content) {
		this.getNode(id).getCaption().setContent(content);
		this.currentMapManager.setNodeContent(id, content);
	},
	
	saveNodePosition : function(id, left, top) {
		this.getNode(id).moveTo(left, top);
		this.currentMapManager.setNodePosition(id, left, top);
	},
	
	/**
	 * 安全的创建新节点。本方法会同时处理model和view，保持两者同步。
	 * 用户创建新节点时都应该调用本方法,而不应该直接调用manager中的createNode方法,
	 * 也不应该直接实例化Node对象。这样做是不安全的，可能会导致model和view的不同步。
	 * @param	{object||string||undefined}data
	 * @return	{object}
	 */
	createNode : function(data) {
		var pid;
		if( kampfer.type(data) === 'string' ) {
			pid = data;
		}else if( kampfer.type(data) === 'object' ) {
			pid = data.parent;
		} else {
			pid = 'map';
		}
		data = this.currentMapManager.createNode(data);
		this.currentMapManager.addNode(data);
		this.getNode(pid).addChild(
			new kampfer.mindMap.Node(data, this, this.currentMapManager), true );
		return data;
	},
	
	deleteNode : function(id) {
		if( kampfer.type(id) === 'object' ) {
			id = id.id;
		}
		var node = this.getNode(id),
			parent = node.getParent();
		this.currentMapManager.deleteNode(id);
		parent.removeChild(node);
	}
	
});
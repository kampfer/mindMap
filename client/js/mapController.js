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
		this.localStoreManager = localStore;
		
		this.currentState = this.initialState;
		
		this.map = new kampfer.mindMap.Map(this.currentMapManager);
		
		this.menuForMap = new kampfer.mindMap.Menu(this.map, this.currentMapManager, this);
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('create node', kampfer.mindMap.command.CreateNode) );
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('save', kampfer.mindMap.command.SaveMap) );
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('redo', kampfer.mindMap.command.Redo) );
		this.menuForMap.addItem( new kampfer.mindMap.MenuItem('undo', kampfer.mindMap.command.Undo) );
		
		this.menuForNode = new kampfer.mindMap.Menu(this.map, this.currentMapManager, this);
		this.menuForNode.addItem( new kampfer.mindMap.MenuItem('create child', kampfer.mindMap.command.CreateNode) );
		this.menuForNode.addItem( new kampfer.mindMap.MenuItem('edit text') );
		this.menuForNode.addItem( new kampfer.mindMap.MenuItem('delete', kampfer.mindMap.command.DeleteNode) );

		kampfer.events.addEvent(this.menuForNode, 'edit text', function() {
			this.map.currentNode.getCaption().insertTextarea();
			this.currentState = 'nodeEditing';
		}, this);
	},
	
	render : function() {
		this.map.render();
		this.menuForNode.render();
		this.menuForMap.render();
	},
	
	getNode : function(id) {
		if(id === 'map') {
			return this.map;
		}
		return this.map.getNode(id);
	},

	monitorEvents : function() {
		var element = this.map.getElement();
		
		kampfer.events.addEvent(element, ['mousedown', 'mousemove', 'mouseup', 
			'mouseover', 'mouseout'], this._handleEvent, this);
		
	},

	_handleEvent : function(event) {
		var func = this.action2Function[this.currentState][event.type];
		if(!func) {
			func = this.action2Function.unexceptedEvent;
		}
		
		this.currentState = func.call(this, event);
	},
	
	action2Function : {
		
		mapActivated : {
			
			mouseover : function(event) {
				var isNode = this.isNodeElement(event.target);
				if( isNode ) {
					return 'nodeActivated';
				}
				return 'mapActivated';
			},
			
			mousedown : function(event) {
				this.menuForNode.hide();

				this.map.currentNode = this.map;
				
				this.saveCursorPosition(event);

				if(event.which === 0) {
					this.menuForMap.hide();
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
			},

			mouseout : function() {
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
				this.map.currentNode = node;
				
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
					node = this.map.currentNode;
			
				node.moveTo(offsetX, offsetY);
				
				return 'nodefocus';
			},
			
			mouseup : function() {
				var currentNodeId = this.map.currentNode.getId(),
					position = this.map.currentNode.getPosition();

				//鼠标在node上点击时也会触发SaveNodePosition
				//所以execute需要判断位置是否发生变化
				var command = new kampfer.mindMap.command.SaveNodePosition(this.map, this.currentMapManager);
				command.execute();
				command.push2Stack();
				console.log(kampfer.mindMap.command.index + ': savePosition');

				return 'nodeActivated';
			}
			
		},
		
		nodeEditing : {
			mousedown : function(event) {
				if( !this.isTextEditor(event.target) ) {
					//var text = this.map.currentNode.getCaption().insertText();
					var command = new kampfer.mindMap.command.SaveNodeContent(
						this.map, this.currentMapManager, this);
					command.execute();
					command.push2Stack();
					console.log(kampfer.mindMap.command.index + ': SaveNodeContent');
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
	
	//储存鼠标坐标,实现拖拽
	saveCursorPosition : function(event) {
		var cur = this.map.currentNode;
		var position = cur.getPosition();
		//map拖拽
		this.lastPageX = event.pageX;
		this.lastPageY = event.pageY;
		//node拖拽
		this.lastCursorX = event.pageX - position.left;
		this.lastCursorY = event.pageY - position.top;
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
	},

	getWindowRect : function() {
		return {
			width : Math.max(document.documentElement.clientWidth,
				document.documentElement.clientWidth),
			height : Math.max(document.documentElement.clientHeight,
				document.documentElement.clientHeight)
		};
	}
	
});
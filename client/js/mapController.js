/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('events');

kampfer.provide('mindMap.MapController');

/*
 * map控制器类
 * 所有的浏览器事件都在这里被注册。view组件订阅mapController的自定义事件
 */
kampfer.mindMap.MapController = kampfer.Class.extend({
	
	init : function(map, mapMenu, nodeMenu) {
		this.currentState = this.initialState;
		
		this.currentNode = this.map;

		this.mapMenu = mapMenu;

		this.nodeMenu = nodeMenu;
		
		this.listen(map);
	},

	listen : function(map) {
		var element = map.getElement();
		
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
				this.nodeMenu.hide();

				//this.currentNode = this.map;
				this.map.setCurrentNode(this.map);
				
				if(event.which === 0) {
					this.mapMenu.hide();
					this.saveCursorPosition(event);
					return 'mapFocus';
				}
				
				if(event.which === 3) {
					this.mapMenu.setPosition(event.pageX, event.pageY);
					this.mapMenu.show();
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
				this.nodeMenu.hide();
				this.mapMenu.hide();
				
				var node = this.getNodeFromElement(event.target);
				//this.currentNode = node;
				this.map.setCurrentNode(node);
				
				if(event.which === 3) {	
					this.nodeMenu.setPosition(event.pageX, event.pageY);
					this.nodeMenu.show();
					return 'nodeActivated';
				}
				
				if(event.which === 0) {
					this.saveCursorPosition(event);
					return 'nodefocus';
				}
			}/*,

			dblclick : function() {
				this.currentNode.getCaption().insertTextarea();
				return 'nodeEditing';
			}*/
			
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
				var currentNodeId = this.currentNode.getId(),
					position = this.currentNode.getPosition();

				//鼠标在node上点击时也会触发SaveNodePosition
				//所以execute需要判断位置是否发生变化
				var command = new kampfer.mindMap.command.SaveNodePosition(currentNodeId, position, this);
				command.execute(true);
				console.log(kampfer.mindMap.command.index);

				return 'nodeActivated';
			}
			
		},
		
		nodeEditing : {
			mousedown : function(event) {
				if( !this.isTextEditor(event.target) ) {
					var text = this.currentNode.getCaption().insertText();
					var command = new kampfer.mindMap.command.SaveNodeContent(
						this.currentNode.getId(), text, this);
					command.execute(true);
					console.log(kampfer.mindMap.command.index);
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
		var cur = this.currentNode || this.map;
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
	},


	//TODO 搬到command.js
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
		//if(data.children) {
		//	for(var n in data.children) {
		//		this.createNode(data.children[n]);
	//		}
		//}
		return data;
	},
	
	setNodeContent : function(id, content) {
		this.getNode(id).getCaption().setContent(content);
		this.currentMapManager.setNodeContent(id, content);
	},
	
	setNodePosition : function(id, left, top) {
		this.getNode(id).moveTo(left, top);
		this.currentMapManager.setNodePosition(id, left, top);
	},
	
	deleteNode : function(id) {
		if( kampfer.type(id) === 'object' ) {
			id = id.id;
		}
		var node = this.getNode(id),
			parent = node.getParent();
		this.currentMapManager.deleteNode(id);
		parent.removeChild(node, true);
	},

	saveMap : function() {
		this.localStoreManager.saveMapToLocalStorage( this.currentMapManager.getMapData() );
	}
	
});
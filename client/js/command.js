/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.command');


//失败的尝试,实例command对象时无法随意的传递参数
//TODO 每个命令对象都监听menu的click事件
//TODO 将mapController中的命令操作移动到本文件
kampfer.mindMap.command.CommandController = kampfer.Class.extend({

	init : function(menu, map, mapManager, mapController) {
		this.menu = menu;

		this.mapController = mapController;

		this.mapManager = mapManager;

		this._commandList = {};

		this._commandMap = {};

		this._nextCommandIndex = 0;

		kampfer.events.addEvent(menu, 'clickitem', this._handleEvent, this);
	},

	_commandMap : null,

	_commandList : null,

	_nextCommandIndex : null,

	menu : null,

	registerCommand : function(name, command) {
		if( !(name in this._commandMap) ) {
			this._commandMap[name] = command;
		}
	},

	unregisterCommand : function(name) {
		if(name in this._commandMap) {
			this._commandMap[name] = null;
		}
	},

	pushCommand : function(command) {
		this.commandList.splice(this._nextCommandIndex++, 0, command);
	},

	_handleEvent : function(event) {
		var command = event.currentItem.innerHTML;

		command = this.getCommand(command);
		if(command) {
			command = new command(this.mapController, event);
			command.execute(true);
		}
	},

	undo : function(level) {
		for(var i = 0; i < level; i++) {
			if(this._nextCommandIndex < this._commandList.length) {
				var command = this._commandList[this._nextCommandIndex++];
				command.execute();
			} else {
				return;
			}
		}
	},

	redo : function(level) {
		for(var i = 0; i < level; i++) {
			if(this._nextCommandIndex > 0) {
				var command = this._commandList[--this._nextCommandIndex];
				command.unExecute();
			} else {
				return;
			}
		}
	},

	dispose : function() {
		this._commandList = null;
		this._commandMap = null;
		this.menu = null;
		this.map = null;
		this.mapManager = null;
		this.mapController = null;
	}

});


kampfer.mindMap.command.Base = kampfer.Class.extend({
	init : function(controller) {
		this.map = controller.map;
		this.mapManager = controller.mapManager;
		document.title = this.mapManager.getMapName() + '*';
	},
	execute : function(needPush) {
		if(needPush) {
			kampfer.mindMap.command.addCommand(this);
		}
	},
	unExecute : function() {},
	dispose : function() {
		this.map = null;
		this.mapManager = null;
	}
});


kampfer.mindMap.command.CreateNewNode = 
	kampfer.mindMap.command.Base.extend({
		init : function(controller, data) {
			this._super(controller);
			this.pid = this.map.getCurrentNode().getId();
			this.offsetX = data.pageX;
			this.offsetY = data.pageY;
		},

		execute : function(needPush) {
			var pid = this.pid, newNode, left, top, mapPosition;

			this._super(needPush);

			if(this.newNode) {
				newNode = this.newNode;
			} else {
				mapPosition = this.map.getPosition();
				newNode = {
					parent : pid,
					offset : {
						x : Math.abs(mapPosition.left) + this.offsetX,
						y : Math.abs(mapPosition.top) + this.offsetY,
					}
				}
			}

			this.newNode = this.mapManager.createNode(newNode);
			this.mapManager.addNode(this.newNode);
			this.map.getChild(pid).addChild(
				new kampfer.mindMap.node(this.newNode, this.mapManager) );
		},
		
		unExecute : function() {
			this._super();
			var id = this.newNode.id,
				node = this.map.getNode(id),
				parent = node.getParent();
			this.mapManager.deleteNode(id);
			parent.removeChild(node, true);
		}
});


kampfer.mindMap.command.DeleteNode = 
	kampfer.mindMap.command.Base.extend({
		init : function() {
			var nodeId;
			this.controller = arguments[1];
			nodeId = this.controller.currentNode.getId();
			this.oldNodeData = this.controller.currentMapManager.getNode(nodeId, true);
		},
		
		execute : function(needPush) {
			this._super(needPush);
			var id;
			if(this.oldNodeData.length) {
				id = this.oldNodeData[0].id;
			} else {
				id = this.oldNodeData.id;
			}
			this.controller.deleteNode(id);
		},
		
		unExecute : function() {
			this._super();
			if(this.oldNodeData.length) {
				for(var i = 0, l = this.oldNodeData.length; i < l; i++) {
					this.controller.createNode(this.oldNodeData[i]);
				}
			} else {
				this.controller.createNode(this.oldNodeData);
			}
		}
});


kampfer.mindMap.command.SaveNodeContent = 
	kampfer.mindMap.command.Base.extend({
		init : function(nodeId, content, controller) {
			this.nodeId = nodeId;
			this.content = content;
			this.controller = controller;
			this.oriContent = controller.currentMapManager.getNode(nodeId).content;
		},
		
		execute : function(needPush) {
			this._super(needPush);
			this.controller.setNodeContent(this.nodeId, this.content);
		},
		
		unExecute : function() {
			this._super();
			this.controller.setNodeContent(this.nodeId, this.oriContent);
		}
});


kampfer.mindMap.command.SaveNodePosition = 
	kampfer.mindMap.command.Base.extend({
		init : function(id, position, controller) {
			this.nodeId = id;
			this.controller = controller;
			this.newPosition = position;
			
			//保存旧位置
			var nodeData = controller.currentMapManager.getNode(id);
			//保存值而不是引用
			this.lastPosition = {
				left : nodeData.offset.x,
				top : nodeData.offset.y
			};
		},
		
		execute : function(needPush) {
			if( !this.isPositionNotChange() ) {
				this._super(needPush);

				this.controller.setNodePosition(this.nodeId, 
					this.newPosition.left, this.newPosition.top);
			}
		},
		
		unExecute : function() {
			this._super();
			this.controller.setNodePosition(this.nodeId,
				this.lastPosition.left, this.lastPosition.top);
		},

		isPositionNotChange : function() {
			if( this.lastPosition.left === this.newPosition.left &&
				this.lastPosition.top === this.newPosition.top ) {
				return true;
			}
			return false;
		}
});


kampfer.mindMap.command.Undo = kampfer.mindMap.command.Base.extend({
	execute : function() {
		var level = 1;
		for(var i = 0; i < level; i++) {
			if(this._nextCommandIndex < this._commandList.length) {
				var command = this._commandList[this._nextCommandIndex++];
				command.execute();
			} else {
				return;
			}
		}
	},

	unExecute : function() {
		kampfer.mindMap.command.redo(1);
	}
});


kampfer.mindMap.command.Redo = kampfer.mindMap.command.Base.extend({
	execute : function() {
		var level = 1;
		for(var i = 0; i < level; i++) {
			if(this._nextCommandIndex > 0) {
				var command = this._commandList[--this._nextCommandIndex];
				command.unExecute();
			} else {
				return;
			}
		}
	},

	unExecute : function() {
		kampfer.mindMap.command.undo(1);
	}
});


kampfer.mindMap.command.Save = kampfer.mindMap.command.Base.extend({
	init : function() {
		this.controller = arguments[1];
	},
	execute : function() {
		this.controller.saveMap();
		document.title = this.mapManager.getMapName();
	}
});
/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.Command');
kampfer.provide('mindMap.commandManager');


kampfer.mindMap.Command = kampfer.Class.extend({
	
	init : function(mapController, mapManager) {
		this.mapController = mapController;
		this.mapManager = mapManager;
	},
	
	execute : function() {
		console.log(kampfer.mindMap.commandManager.index);
	},
	
	unExecute : function() {
		console.log(kampfer.mindMap.commandManager.index);
	}
	
});


kampfer.mindMap.commandManager = {
	
	index : 0,
	
	commandList : [],
	
	addCommand : function(command) {
		this.commandList.push(command);
		this.index++;
	},
	
	redo : function(level) {
		for(var i = 0; i < level; i++) {
			if(this.index < this.commandList.length) {
				var command = this.commandList[this.index++];
				command.execute();
			} else {
				return;
			}
		}
	},
	
	undo : function(level) {
		for(var i = 0; i < level; i++) {
			if(this.index > 0) {
				var command = this.commandList[--this.index];
				command.unExecute();
			} else {
				return;
			}
		}
	}
	
};


kampfer.mindMap.commandManager.createNodeCommand = 
	kampfer.mindMap.Command.extend({
		init : function(pid, controller) {
			this.pid = pid;
			this.controller = controller;
		},
		
		execute : function() {
			this._super();
			var data = this.nodeData || this.pid;
			this.nodeData = this.controller.createNode(data);
		},
		
		unExecute : function() {
			this._super();
			var id = this.nodeData.id;
			this.controller.deleteNode(id);
		}
});


kampfer.mindMap.commandManager.deleteNodeCommand = 
	kampfer.mindMap.Command.extend({
		init : function(nodeId, controller) {
			this.nodeId = nodeId;
			this.controller = controller;
			this.oldNodeData = controller.getNodeData(nodeId);
		},
		
		execute : function() {
			this._super();
			this.controller.deleteNode(this.nodeId);
		},
		
		unExecute : function() {
			this._super();
			this.controller.createNode(this.oldNodeData);
		}
});


kampfer.mindMap.commandManager.saveNodeContentCommand = 
	kampfer.mindMap.Command.extend({
		init : function(nodeId, content, controller) {
			this.nodeId = nodeId;
			this.content = content;
			this.controller = controller;
			this.oriContent = controller.getNodeData(nodeId).content;
		},
		
		execute : function() {
			this._super();
			this.controller.saveNodeContent(this.nodeId, this.content);
		},
		
		unExecute : function() {
			this._super();
			this.controller.saveNodeContent(this.nodeId, this.oriContent);
		}
});


kampfer.mindMap.commandManager.saveNodePositionCommand = 
	kampfer.mindMap.Command.extend({
		init : function(nodeId, position, controller) {
			this.nodeId = nodeId;
			this.controller = controller;
			this.newPosition = position;
			
			//保存旧位置
			var nodeData = controller.getNodeData(nodeId);
			//保存值而不是引用
			this.lastPosition = {
				left : nodeData.offset.x,
				top : nodeData.offset.y
			};
		},
		
		execute : function() {
			this._super();
			this.controller.saveNodePosition(this.nodeId, 
				this.newPosition.left, this.newPosition.top);
		},
		
		unExecute : function() {
			this._super();
			this.controller.saveNodePosition(this.nodeId,
				this.lastPosition.left, this.lastPosition.top);
		}
});
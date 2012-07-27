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
	
	execute : function() {},
	
	unExecute : function() {}
	
});


kampfer.mindMap.commandManager = {
	
	index : 0,
	
	commandList : [],
	
	addCommand : function(command) {
		this.commandList.push(command);
		this.index++;
		//console.log(this.index);
	},
	
	redo : function(level) {
		for(var i = 0; i < level; i++) {
			if(this.index < this.commandList.length) {
				var command = this.commandList[this.index++];
				//console.log(this.index);
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
				//console.log(this.index);
				command.unExecute();
			} else {
				return;
			}
		}
	}
	
};


kampfer.mindMap.commandManager.createNodeCommand = 
	kampfer.mindMap.Command.extend({
		init : function() {
		},
		
		execute : function() {
			var parentNode = this.mapController.currentNode,
				pid = parentNode.getId(),
				data = this.mapManager.createNode(pid);
			
			var newNode = new kampfer.mindMap.Node(data, 
				this.mapController, this.mapManager);
			this.mapController.currentNode.addChild(newNode, true);
			
			this.pid = pid;
			this.newNodeId = newNode.getId();
		},
		
		unExecute : function() {
			this.mapManager.deleteNode(this.newNodeId);
			var parentNode = this.mapController.getNode(this.pid);
			var newNode = this.MapController.getNode(this.newNodeId);
			parentNode.removeChild(newNode);
		}
});


kampfer.mindMap.commandManager.deleteNodeCommand = 
	kampfer.mindMap.Command.extend({
		execute : function() {
			var deletedNode = this.mapController.currentNode,
				id = deletedNode.getId();
			
			this.deletedNodeData = this.mapManager.getNode(id);
			
			var parentNode = deletedNode.getParent();
			this.mapManager.deleteNode(id);
			parentNode.removeChild(deletedNode);
		},
		
		unExecute : function() {
			var parentNode = this.mapController.getNode(this.deletedNodeData.parent),
				newNode = new kampfer.mindMap.Node(this.deletedNodeData, 
				this.mapController, this.mapManager);
				
			this.mapManager.createNode(this.deletedNodeData);
			parentNode.addChild(newNode);
		}
});


kampfer.mindMap.commandManager.saveNodeContentCommand = 
	kampfer.mindMap.Command.extend({
		init : function(node, content, controller) {
			this.node = node;
			this.content = content;
			this.controller = controller;
			this.oriContent = controller.getNodeData(node).content;
		},
		
		execute : function() {
			this.controller.saveNodeContent(this.node, this.content);
		},
		
		unExecute : function() {
			this.controller.saveNodeContent(this.node, this.oriContent);
		}
});


//TODO 代码脏乱，需要整理
kampfer.mindMap.commandManager.saveNodePositionCommand = 
	kampfer.mindMap.Command.extend({
		init : function(node, mapManager, position) {
			this.node = node;
			this.mapManager = mapManager;
			this.newPosition = position;
			
			var nodeData = mapManager.getNode( node.getId() );
			this.lastPosition = {
				left : nodeData.offset.x,
				top : nodeData.offset.y
			};
		},
		
		execute : function() {
			var id = this.node.getId();
			
			this.mapManager.setNodePosition(id, 
				this.newPosition.left, this.newPosition.top);
			this.node.moveTo(this.newPosition.left, this.newPosition.top);
		},
		
		unExecute : function() {
			var id = this.node.getId(),
				offset = this.lastPosition;
			
			this.mapManager.setNodePosition(id, offset.left, offset.top);
			this.node.moveTo(offset.left, offset.top);
		}
});
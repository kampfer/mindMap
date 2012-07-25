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
	},
	
	redo : function(level) {
		for(var i = 0; i < level; i++) {
			if(this.index < this.commandList.length - 1) {
				var command = this.commandList[this.index++];
				command.execute();
			} else {
				return;
			}
		}
	},
	
	undo : function(level) {
		for(var i = 0; i < level; i++) {
			if(this.index < this.commandList.length - 1) {
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
		execute : function() {
			var parentNode = this.mapController.currentNode;
			var pid = parentNode.getId();
			var data = this.mapManager.createNode(pid);
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
			var node = this.mapController.currentNode;
			parentNode = this.node.getParent();
			this.mapManager.deleteNode( this.node.getId() );
			parentNode.removeChild(this.node);
		},
		unExecute : function() {
			
		}
});

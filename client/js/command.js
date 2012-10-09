/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.command');


kampfer.mindMap.command.Base = kampfer.Class.extend({

	//init : function(mapController, mapManager) {
	//	this.mapController = mapController;
	//	this.mapManager = mapManager;
	//},
	init : function() {
	
	},
	
	execute : function() {
		//console.log(kampfer.mindMap.commandManager.index);
		kampfer.mindMap.command.addCommand(this);
	},
	
	unExecute : function() {
		//console.log(kampfer.mindMap.commandManager.index);
	},
	
	bind : function() {},
	
	dispose : function() {}
	
});


kampfer.mindMap.command.commandList = [];


kampfer.mindMap.command.index = 0;


kampfer.mindMap.command.addCommand = function(command) {
	this.commandList.push(command);
	this.index++;
};


kampfer.mindMap.command.redo = function(level) {
	for(var i = 0; i < level; i++) {
		if(this.index < this.commandList.length) {
			var command = this.commandList[this.index++];
			command.execute();
		} else {
			return;
		}
	}
};


kampfer.mindMap.command.undo = function(level) {
	for(var i = 0; i < level; i++) {
		if(this.index > 0) {
			var command = this.commandList[--this.index];
			command.unExecute();
		} else {
			return;
		}
	}
};


kampfer.mindMap.command.createNewNode = 
	kampfer.mindMap.command.Base.extend({
		init : function(menu) {
			kampfer.events.addEvent(menu, 'clickitem', this.execute, this);
		},
		
		execute : function(event) {
			var controller = event.target.mapController, 
				currentNode = controller.currentNode.getId(),
				newNode;
			
			this._super();
			
			newNode = controller.createNode(currentNode);
			
			if(currentNode === 'map') {
				var mapPosition = controller.map.getPosition();
				controller.saveNodePosition( newNode.id, 
					Math.abs(mapPosition.left) + event.pageX,
					Math.abs(mapPosition.top) + event.pageY );
			}
		},
		
		unExecute : function() {
			this._super();
			var id = this.nodeData.id;
			this.controller.deleteNode(id);
		}
});


kampfer.mindMap.command.deleteNodeCommand = 
	kampfer.mindMap.command.Base.extend({
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


kampfer.mindMap.command.saveNodeContentCommand = 
	kampfer.mindMap.command.Base.extend({
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


kampfer.mindMap.command.saveNodePositionCommand = 
	kampfer.mindMap.command.Base.extend({
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
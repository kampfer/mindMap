/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.command');


kampfer.mindMap.command.Base = kampfer.Class.extend({

	init : function(controller, menu, tag) {
		kampfer.events.addEvent(menu, 'clickitem', this._handleEvent, this);

		this.controller = controller;

		this.tag = tag;
	},
	
	execute : function() {
		//console.log(kampfer.mindMap.commandManager.index);
		kampfer.mindMap.command.addCommand(this);
	},
	
	unExecute : function() {
		//console.log(kampfer.mindMap.commandManager.index);
	},

	_handleEvent : function(event) {
		if(event.currentItem.innerHTML === this.tag) {
			this.execute(event);
		}
	},
	
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


kampfer.mindMap.command.CreateNewNode = 
	kampfer.mindMap.command.Base.extend({
		execute : function(event) {
			var controller = this.controller,
				currentNode = controller.currentNode.getId();
			
			this._super();
			
			this.newNode = controller.createNode(currentNode);
			
			if(currentNode === 'map') {
				var mapPosition = controller.map.getPosition();
				controller.saveNodePosition( this.newNode.id,
					Math.abs(mapPosition.left) + event.pageX,
					Math.abs(mapPosition.top) + event.pageY );
			}
		},
		
		unExecute : function() {
			this._super();
			this.controller.deleteNode(this.newNode.id);
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

kampfer.mindMap.command.Undo = kampfer.mindMap.command.Base.extend({
	execute : function() {
		kampfer.mindMap.command.undo(1);
	},

	unExecute : function() {
		kampfer.mindMap.command.redo(1);
	}
});

kampfer.mindMap.command.Redo = kampfer.mindMap.command.Base.extend({
	execute : function() {
		kampfer.mindMap.command.redo(1);
	},

	unExecute : function() {
		kampfer.mindMap.command.undo(1);
	}
});
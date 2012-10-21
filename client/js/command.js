/*global window kampfer console localStorage*/
kampfer.require('Class');
kampfer.require('events');
kampfer.require('mindMap.Node');

kampfer.provide('mindMap.command');


kampfer.mindMap.command.commandList = [];


kampfer.mindMap.command.index = 0;


kampfer.mindMap.command.Base = kampfer.Class.extend({
	init : function() {},

	execute : function() {},

	unExecute : function() {},

	needPush : false,

	//command默认是可执行的
	isAvailable : function() {
		return true;
	},

	push2Stack : function() {
		if( this.needPush ) {
			var kmc = kampfer.mindMap.command;
			var length = kmc.commandList.length - kmc.index;
			kmc.commandList.splice(kmc.index++, length, this);
		}
	},

	dispose : function() {}
});


//createNode 不维护后代节点
kampfer.mindMap.command.CreateNode = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager, controller) {
		this.map = map;
		this.mapManager = mapManager;
		this.commandTargt = map.currentNode;

		var mapPosition = map.getPosition();
		if(this.commandTargt.getId() === 'map') {
			this.offsetX = Math.abs(mapPosition.left) + controller.lastPageX;
			this.offsetY = Math.abs(mapPosition.top) + controller.lastPageY;
		}
	},

	nodeData : null,

	needPush : true,

	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		if(!this.nodeData) {
			var node = {
				parent : this.commandTargt.getId()
			};
			if(node.parent === 'map') {
				node.offset = {};
				node.offset.x = this.offsetX;
				node.offset.y = this.offsetY;
			}
			this.nodeData = this.mapManager.createNode(node);
		}
		this.mapManager.addNode(this.nodeData);
		this.commandTargt.addChild( 
			new kampfer.mindMap.Node(this.nodeData, this.mapManager), true );
	},

	unExecute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		this.commandTargt.removeChild(this.nodeData.id, true);
		this.mapManager.deleteNode(this.nodeData.id);
	},

	dispose : function() {
		this.nodeData = null;
		this.map = null;
		this.mapManger = null;
	}
});


kampfer.mindMap.command.DeleteNode = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager, mapController) {
		this.map = map;
		this.mapManager = mapManager;
		this.commandTarget = map.currentNode.getParent();
		this.nodeId = map.currentNode.getId();
	},

	nodeData : null,

	needPush : true,

	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		if(!this.nodeData) {
			this.nodeData = this.mapManager.getNode(this.nodeId, true);
		}
		this.commandTarget.removeChild(this.nodeId, true);
		this.mapManager.deleteNode(this.nodeId);
	},

	unExecute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		var node;
		if(this.nodeData.length) {
			for(var i = 0, l = this.nodeData.length; i < l; i++) {
				node = this.mapManager.createNode(this.nodeData[i]);
				this.mapManager.addNode(node);
			}
			//node类会自动添加后代节点，所以不在循环中添加addChild
			this.commandTarget.addChild( 
				new kampfer.mindMap.Node(this.nodeData[0], this.mapManager), true );
		} else {
			node = this.mapManager.createNode(this.nodeData);
			this.mapManager.addNode(node);
			this.commandTarget.addChild( 
				new kampfer.mindMap.Node(node, this.mapManager), true );
		}
	},

	dispose : function() {
		this.nodeData = null;
		this.map = null;
		this.mapManger = null;
	}
});


kampfer.mindMap.command.SaveNodePosition = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager) {
		this.map = map;
		this.mapManager = mapManager;
		this.nodeId = map.currentNode.getId();
		this.newPos = this.map.getNode(this.nodeId).getPosition();
		this.oriPos = mapManager.getNodePosition(this.nodeId);
	},

	needPush : true,

	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		//不需要再改变view的位置
		//不直接使用map.currentNode是因为它会随时改变
		this.map.getNode(this.nodeId).moveTo(this.newPos.left, this.newPos.top);
		this.mapManager.setNodePosition(this.nodeId, this.newPos.left, this.newPos.top);
	},

	unExecute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		this.map.getNode(this.nodeId).moveTo(this.oriPos.left, this.oriPos.top);
		this.mapManager.setNodePosition(this.nodeId, this.oriPos.left, this.oriPos.top);
	},

	dispose : function() {
		this.map = null;
		this.mapManager = null;
		this.newPos = null;
		this.oriPos = null;
	}
});


kampfer.mindMap.command.SaveNodeContent = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager, mapController) {
		this.map = map;
		this.mapManager = mapManager;
		this.mapController = mapController;
		this.nodeId = map.currentNode.getId();
		this.oriContent = mapManager.getNodeContent(this.nodeId);
	},

	needPush : true,

	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		var caption = this.map.getNode(this.nodeId).getCaption();
		if(!this.newContent) {
			this.newContent = caption.insertText();
		}
		caption.setContent(this.newContent);
		this.mapManager.setNodeContent(this.nodeId, this.newContent);
	},

	unExecute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		this.map.getNode(this.nodeId).getCaption().setContent(this.oriContent);
		this.mapManager.setNodeContent(this.nodeId, this.oriContent);
	},

	dispose : function() {
		this.map = null;
		this.mapManager = null;
		this.mapController = null;
	}
});


kampfer.mindMap.command.SaveMap = kampfer.mindMap.command.Base.extend({
	init : function(map, mapManager) {
		this.mapManager = mapManager;
	},

	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		if( this.isAvailable() ) {
			this.mapManager.saveMap();
		}
	},

	isAvailable : function() {
		return this.mapManager.isModified();
	},

	dispose : function() {
		this.mapManager = null;
	}
});


kampfer.mindMap.command.Undo = kampfer.mindMap.command.Base.extend({
	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		var kmc = kampfer.mindMap.command;
		for(var i = 0; i < this.level; i++) {
			if(kmc.index > 0) {
				var command = kmc.commandList[--kmc.index];
				command.unExecute();
			} else {
				return;
			}
		}
	},

	level : 1,

	isAvailable : function() {
		if(kampfer.mindMap.command.index <= 0) {
			return false;
		}
		return true;
	}
});


kampfer.mindMap.command.Redo = kampfer.mindMap.command.Base.extend({
	execute : function() {
		if( !this.isAvailable() ) {
			return;
		}
		var kmc = kampfer.mindMap.command;
		for(var i = 0; i < this.level; i++) {
			if(kmc.index <kmc.commandList.length) {
				var command = kmc.commandList[kmc.index++];
				command.execute();
			} else {
				return;
			}
		}
	},

	level : 1,

	isAvailable : function() {
		if( kampfer.mindMap.command.index >= 
			kampfer.mindMap.command.commandList.length ) {
			return false;
		} 
		return true;
	}
});
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

	//command默认是可执行的
	isAvailable : function() {
		return true;
	},

	push2Stack : function() {
		var kmc = kampfer.mindMap.command;
		var length = kmc.commandList.length - kmc.index;
		kmc.commandList.splice(kmc.index++, length, this);
	},

	dispose : function() {}
});


//createNode 不维护后代节点
kampfer.mindMap.command.CreateNode = kampfer.mindMap.command.Base.extend({
	init : function(data, map, mapManager) {
		this.map = map;
		this.mapManager = mapManager;
		if(data.target.id === 'map') {
			this.offsetX = data.pageX;
			this.offsetY = data.pageY;
		}
		this.pid = data.target.id;
	},

	nodeData : null,

	execute : function() {
		var node = {
			parent : this.pid
		};
		if(this.pid === 'map') {
			node.offset = {};
			node.offset.x = this.offsetX;
			node.offset.y = this.offsetY;
		}
		this.nodeData = this.mapManager.createNode(node);
		this.mapManager.addNode(this.nodeData);
		this.map.addChild( new kampfer.mindMap.Node(this.nodeData), true );
	},

	unExecute : function() {
		this.map.removeChild(this.nodeData.id, true);
		this.mapManager.removeChild(this.NodeData.id);
	},

	dispose : function() {
		this.nodeData = null;
		this.map = null;
		this.mapManger = null;
	}
});


kampfer.mindMap.command.DeleteNode = kampfer.mindMap.command.Base.extend({
	init : function(data, map, mapManager) {
		this.map = map;
		this.mapManager = mapManager;
		this.nodeId = data.target.id;
	},

	nodeData : null,

	execute : function() {
		if(!this.nodeData) {
			this.nodeData = this.mapManager.getNode(this.nodeId, true);
		}
		this.map.removeChild(this.nodeId, true);
		this.mapManager.removeChild(this.nodeId);
	},

	unExecute : function() {
		var node;
		if(this.nodeData.length) {
			for(var i = 0, l = this.nodeData.length; i < l; i++) {
				node = this.mapManager.createNode(this.nodeData[i]);
				this.mapManager.addNode(node);
				this.map.addChild( new kampfer.mindMap.Node(node), true );
			}
		} else {
			node = this.mapManager.createNode(this.nodeData);
			this.mapManager.addNode(node);
			this.map.addChild( new kampfer.mindMap.Node(node), true );
		}
	},

	dispose : function() {
		this.nodeData = null;
		this.map = null;
		this.mapManger = null;
	}
});


kampfer.mindMap.command.SaveNodePosition = kampfer.mindMap.command.Base.extend({
	init : function(data, map, mapManager) {
		this.map = map;
		this.mapManager = mapManager;
		this.id = data.target.id;
		this.newPos = this.map.getChild(id).getPosition();
		this.oriPos = mapManager.getNodePosition(this.id);
	},

	execute : function() {
		//不需要再改变view的位置
		//this.map.getChild(this.id).moveTo(this.newPos.left, this.newPos.top);
		this.mapManager.setNodePosition(this.id, this.newPos.left, this.newPos.top);
	},

	unExecute : function() {
		this.map.getChild(this.id).moveTo(this.oriPos.left, this.oriPos.top);
		this.mapManager.setNodePosition(this.id, this.oriPos.left, this.oriPos.top);
	},

	dispose : function() {
		this.map = null;
		this.mapManager = null;
		this.newPos = null;
		this.oriPos = null;
	}
});


kampfer.mindMap.command.SaveNodeContent = kampfer.mindMap.command.Base.extend({
	init : function(data, map, mapManager) {
		this.map = map;
		this.mapManager = mapManager;
		this.mapController = mapController;
		this.nodeId = data.target.id;
		this.oriContent = mapManager.getNodeContent(this.nodeId);
	},

	execute : function() {
		if(this.newContent) {
			this.map.getChild(this.nodeId).getCaption().setNode(this.newContent);
			this.mapManager.setNodeContent(this.nodeId, this.newContent);
			return;
		}

		this.map.getChild(this.nodeId).getCaption().insertTextarea();
		this.mapController.currentState = 'nodeEditing';
		this.eventKey = kampfer.events.addEvent(this.controller, 'saveNodeContent', function() {
			var caption = this.map.getChild(this.nodeId);
			this.newContent = caption.insertText();
			caption.setContent(this.newContent);
			this.mapManager.setNodeContent(this.nodeId, this.newContent);
		}, this);
	},

	unExecute : function() {
		this.map.getChild(this.nodeId).getCaption().setNode(this.oriContent);
		this.mapManager.setNodeContent(this.nodeId, this.oriContent);
		kampfer.events.removeEventByKey(this.controller, 'saveNodeContent', this.eventKey);
	},

	dispose : function() {
		kampfer.events.removeEventByKey(this.controller, 'saveNodeContent', this.eventKey);
		this.map = null;
		this.mapManager = null;
		this.mapController = null;
	}
});


kampfer.mindMap.command.SaveMap = kampfer.mindMap.command.Base.extend({
	init : function(localStorage, mapManager) {
		localStorage.saveMapToLocalStorage( mapManager.getMapData() );
	}
});


kampfer.mindMap.command.Undo = kampfer.mindMap.command.Base.extend({
	init : function() {
		var kmc = kampfer.mindMap.command;
		for(var i = 0; i < level; i++) {
			if(kmc.index > 0) {
				var command = kmc.commandList[--kmc.index];
				command.unExecute();
			} else {
				return;
			}
		}
	},

	isAvailable : function() {
		if(kampfer.mindMap.command.index <= 0) {
			return false;
		}
		return true;
	}
});


kampfer.mindMap.command.Redo = kampfer.mindMap.command.Base.extend({
	init : function() {
		var kmc = kampfer.mindMap.command;
		for(var i = 0; i < level; i++) {
			if(kmc.index <kmc.commandList.length) {
				var command = kmc.commandList[kmc.index++];
				command.execute();
			} else {
				return;
			}
		}
	},

	isAvailable : function() {
		if( kampfer.mindMap.command.index >= 
			kampfer.mindMap.command.commandList.length ) {
			return false;
		} 
		return true;
	}
});